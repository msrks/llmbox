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
import { s3Client } from "@/lib/s3-file-management";
import { GetObjectOutput } from "@aws-sdk/client-s3";
import { createInsertSchema } from "drizzle-zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { Readable } from "node:stream";
import OpenAI from "openai";
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

  // Trigger the evaluation task
  // try {
  //   await fetch(
  //     // `${process.env.NEXT_PUBLIC_APP_URL}/api/evaluate?evalId=${newEvaluation.id}`
  //     `/api/evaluate?evalId=${newEvaluation.id}`
  //   );
  // } catch (error) {
  //   console.error("Failed to trigger evaluation task:", error);
  // }

  after(async () => {
    const startTime = Date.now();
    const filesForEvaluation = await getFilesForEvaluation(projectId);
    if (filesForEvaluation.length === 0) {
      await updatePromptEvaluation(newEvaluation.id, { state: "failed" });
    }
    const evaluationResults = await Promise.all(
      filesForEvaluation.map(async (file) => {
        const obj = (await s3Client.getObject(
          process.env.S3_BUCKET_NAME!,
          file.fileName
        )) as GetObjectOutput;

        const streamToBuffer = async (stream: Readable) => {
          const chunks = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          return Buffer.concat(chunks);
        };

        const buffer = await streamToBuffer(obj.Body as Readable);
        const base64Image = buffer.toString("base64");

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
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
                    url: `data:image/${file.mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });

        const parsedResponse = JSON.parse(
          completion.choices[0].message.content || "{}"
        );

        await db.insert(evalDetails).values({
          fileId: file.id,
          promptEvalId: newEvaluation.id,
          llmLabel: parsedResponse.classification.toLowerCase() as
            | "pass"
            | "fail",
          llmReason: parsedResponse.explanation,
          result:
            parsedResponse.classification.toLowerCase() ===
            (file.humanLabel || "").toLowerCase()
              ? "correct"
              : "incorrect",
        });

        return {
          isCorrect:
            parsedResponse.classification.toLowerCase() ===
            (file.humanLabel || "").toLowerCase(),
        };
      })
    );

    const validResults = evaluationResults.filter(
      (result): result is { isCorrect: boolean } => result !== null
    );
    const totalEvaluations = validResults.length;
    const correctEvaluations = validResults.filter(
      (result) => result.isCorrect
    ).length;

    await updatePromptEvaluation(newEvaluation.id, {
      state: "finished",
      score: correctEvaluations / totalEvaluations,
      duration: Math.round((Date.now() - startTime) / 1000),
      numDataset: totalEvaluations,
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
