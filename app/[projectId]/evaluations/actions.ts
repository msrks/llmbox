"use server";

import { db } from "@/lib/db/drizzle";
import { getCriterias } from "@/lib/db/queries/criterias";
import { getFilesForEvaluation } from "@/lib/db/queries/files";
import { getInspectionSpec } from "@/lib/db/queries/inspectionSpecs";
import {
  createPromptEvaluation,
  deletePromptEvaluation,
  updatePromptEvaluation,
} from "@/lib/db/queries/promptEvaluations";
import { getPromptTemplate } from "@/lib/db/queries/promptTemplates";
import { evalDetails, promptEvaluations } from "@/lib/db/schema";
import { s3Client, streamToBuffer } from "@/lib/s3-file-management";
import { createInsertSchema } from "drizzle-zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

export async function createEvaluationForm(
  prevState: {
    error: string;
    promptTemplateId: string;
    inspectionSpecId: string;
  },
  formData: FormData
) {
  // finalPrompt is optional in the form data
  const result = createInsertSchema(promptEvaluations, {
    finalPrompt: z.string().optional(),
  }).safeParse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    promptTemplateId: Number(formData.get("promptTemplateId")),
    inspectionSpecId: Number(formData.get("inspectionSpecId")),
    projectId: Number(formData.get("projectId")),
  });

  if (!result.success) {
    console.error(result.error.errors);
    return {
      error: result.error.errors[0].message,
      promptTemplateId: prevState.promptTemplateId,
      inspectionSpecId: prevState.inspectionSpecId,
    };
  }

  const { promptTemplateId, inspectionSpecId, projectId } = result.data;

  const promptTemplate = await getPromptTemplate(promptTemplateId);
  const inspectionSpec = await getInspectionSpec(inspectionSpecId);

  if (!promptTemplate || !inspectionSpec) {
    return {
      error: "Prompt template or inspection spec not found",
      promptTemplateId: prevState.promptTemplateId,
      inspectionSpecId: prevState.inspectionSpecId,
    };
  }

  const criterias = await getCriterias(projectId);

  const finalPrompt = promptTemplate.text
    .replace("{{INSPECTION_SPEC}}", inspectionSpec.text)
    .replace("{{CRITERIAS}}", criterias.map((c) => c.name).join(","));

  const newEvaluation = await createPromptEvaluation({
    ...result.data,
    finalPrompt,
    state: "running",
  });

  after(async () => {
    const startTime = Date.now();
    const filesForEvaluation = await getFilesForEvaluation(projectId);
    if (filesForEvaluation.length === 0) {
      await updatePromptEvaluation(newEvaluation.id, { state: "failed" });
    }
    const evaluationResults = await Promise.all(
      filesForEvaluation.map(async (file) => {
        const obj = await s3Client.getObject(
          process.env.S3_BUCKET_NAME!,
          file.fileName
        );
        const base64Image = (await streamToBuffer(obj)).toString("base64");

        const completion = await openai.beta.chat.completions.parse({
          model: "gpt-4o-mini",
          temperature: 0,

          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that evaluates images.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: finalPrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${file.mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          // <classification_response>
          // <explanation>
          // [Provide a detailed explanation of your reasoning, referencing specific aspects of the image and how they relate to the inspection criteria]
          // </explanation>
          // <criteria_results>
          // [Provide a list of criteria results, each value is either pass or fail]
          // </criteria_results>
          // <final_result>
          // [Provide the final result, either pass or fail]
          // </final_result>
          // </classification_response>
          response_format: zodResponseFormat(
            z.object({
              explanation: z.string(),
              criteriaResults: z.array(z.enum(["pass", "fail"])),
              finalResult: z.enum(["pass", "fail"]),
            }),
            "classification_response"
          ),
        });

        const parsedResponse = completion.choices[0].message.parsed;

        await db.insert(evalDetails).values({
          fileId: file.id,
          promptEvalId: newEvaluation.id,
          llmLabel: parsedResponse?.finalResult.toLowerCase() as
            | "pass"
            | "fail",
          llmReason: parsedResponse?.explanation || "",
          result:
            parsedResponse?.finalResult.toLowerCase() ===
            (file.humanLabel || "").toLowerCase()
              ? "correct"
              : "incorrect",
        });

        return {
          isCorrect:
            parsedResponse?.finalResult.toLowerCase() ===
            (file.humanLabel || "").toLowerCase(),
          sentenseSummaryOfResult: `{fileName: ${file.fileName}, humanLabel: ${
            file.humanLabel
          }, llmLabel: ${parsedResponse?.finalResult.toLowerCase()}}`,
        };
      })
    );

    const validResults = evaluationResults.filter(
      (
        result
      ): result is { isCorrect: boolean; sentenseSummaryOfResult: string } =>
        result !== null
    );
    const totalEvaluations = validResults.length;
    const correctEvaluations = validResults.filter(
      (result) => result.isCorrect
    ).length;

    const sentenceSummaryOfEvalutionResults = evaluationResults
      .map((result) => result.sentenseSummaryOfResult)
      .join("\n");

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `Based on the evaluation results, provide a problem of the current results.`,
        },
        {
          role: "user",
          content: [{ type: "text", text: sentenceSummaryOfEvalutionResults }],
        },
      ],
      response_format: zodResponseFormat(
        z.object({
          analysisText: z.string(),
        }),
        "analysis_text"
      ),
    });

    await updatePromptEvaluation(newEvaluation.id, {
      state: "finished",
      score: correctEvaluations / totalEvaluations,
      duration: Math.round((Date.now() - startTime) / 1000),
      numDataset: totalEvaluations,
      analysisText: completion.choices[0].message.parsed?.analysisText || "",
    });

    revalidatePath(`/${newEvaluation.projectId}/evaluations`);
  });

  redirect(`/${result.data.projectId}/evaluations`);
}

export async function deleteEvaluationResultAction(id: string) {
  const deletedEvaluationResult = await deletePromptEvaluation(parseInt(id));
  revalidatePath(`/${deletedEvaluationResult[0].projectId}/evaluations`);
  return { success: true };
}
