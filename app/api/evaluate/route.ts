import { db } from "@/lib/db/drizzle";
import {
  evalDetails,
  EvalResult,
  files,
  PromptEvalState,
  promptEvaluations,
} from "@/lib/db/schema";
import { s3Client } from "@/lib/s3-file-management";
import { eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const promptId = searchParams.get("promptId");
  const specId = searchParams.get("specId");
  const projectId = searchParams.get("projectId");

  if (!promptId || !specId || !projectId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const startTime = Date.now();

    // Get files with human labels
    const filesToEvaluate = await db
      .select()
      .from(files)
      .where(eq(files.projectId, parseInt(projectId)))
      .where(isNotNull(files.humanLabel));

    if (filesToEvaluate.length === 0) {
      return NextResponse.json(
        { error: "No files found with human labels" },
        { status: 404 }
      );
    }

    // Create evaluation record
    const [evaluation] = await db
      .insert(promptEvaluations)
      .values({
        projectId: parseInt(projectId),
        promptId: parseInt(promptId),
        specId: parseInt(specId),
        finalPrompt: "Evaluating...",
        state: PromptEvalState.RUNNING,
      })
      .returning();

    // Process files in parallel
    const evaluationResults = await Promise.all(
      filesToEvaluate.map(async (file) => {
        try {
          // Get file content from S3
          const response = await s3Client.getObject({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: file.fileName,
          });

          const content = await new Promise<string>((resolve, reject) => {
            let data = "";
            response
              .createReadStream()
              .on("data", (chunk) => (data += chunk))
              .on("end", () => resolve(data))
              .on("error", reject);
          });

          // Call OpenAI for classification
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `You are an AI assistant that classifies content based on given criteria. Your response should be in JSON format with two fields: "classification" (either "pass" or "fail") and "explanation" (a brief reason for the classification).`,
              },
              {
                role: "user",
                content: `Please classify the following content:\n\n${content}`,
              },
            ],
            response_format: { type: "json_object" },
          });

          const parsedResponse = JSON.parse(
            completion.choices[0].message.content || "{}"
          );

          // Create eval result
          await db.insert(evalDetails).values({
            fileId: file.id,
            promptEvalId: evaluation.id,
            llmLabel: parsedResponse.classification.toLowerCase() as
              | "pass"
              | "fail",
            llmReason: parsedResponse.explanation,
            result:
              parsedResponse.classification.toLowerCase() ===
              (file.humanLabel || "").toLowerCase()
                ? EvalResult.CORRECT
                : EvalResult.INCORRECT,
          });

          // Return result for score calculation
          return {
            isCorrect:
              parsedResponse.classification.toLowerCase() ===
              (file.humanLabel || "").toLowerCase(),
          };
        } catch (error) {
          console.error(`Error processing file ${file.id}:`, error);
          return null;
        }
      })
    );

    // Calculate score from parallel results
    const validResults = evaluationResults.filter(
      (result): result is { isCorrect: boolean } => result !== null
    );
    const totalEvaluations = validResults.length;
    const correctEvaluations = validResults.filter(
      (result) => result.isCorrect
    ).length;

    // Calculate score as percentage of correct evaluations
    const score =
      totalEvaluations > 0 ? (correctEvaluations / totalEvaluations) * 100 : 0;

    // Calculate duration in seconds
    const duration = Math.round((Date.now() - startTime) / 1000);

    // Generate analysis text
    const analysisText = `Evaluation completed with ${correctEvaluations} correct out of ${totalEvaluations} total evaluations (${score.toFixed(
      1
    )}% accuracy). ${
      totalEvaluations === 0
        ? "No files were evaluated."
        : correctEvaluations === totalEvaluations
        ? "The prompt performed perfectly on all test cases."
        : score > 80
        ? "The prompt performed well but there's room for improvement."
        : score > 50
        ? "The prompt needs significant improvements to be more accurate."
        : "The prompt performed poorly and needs major revisions."
    }`;

    // Update evaluation with results
    await db
      .update(promptEvaluations)
      .set({
        score,
        state: PromptEvalState.FINISHED,
        duration,
        analysisText,
        numDataset: totalEvaluations,
      })
      .where(eq(promptEvaluations.id, evaluation.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Evaluation error:", error);

    return NextResponse.json(
      { error: "Failed to process evaluation" },
      { status: 500 }
    );
  }
}
