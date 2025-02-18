import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { files, promptEvaluations, evalResults, labels } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import OpenAI from "openai";
import { PromptEvalState, EvalResult } from "@/lib/db/schema";
import { s3Client } from "@/lib/s3-file-management";

const openai = new OpenAI();

const ModelName = "gpt-4o-mini";

function parseOpenAIResponse(
  response: string
): { classification: string; explanation: string } | null {
  try {
    // Extract content between tags using regex
    const classificationMatch = response.match(
      /<classification>(.*?)<\/classification>/s
    );
    const explanationMatch = response.match(
      /<explanation>(.*?)<\/explanation>/s
    );

    if (!classificationMatch || !explanationMatch) {
      console.error("Failed to parse OpenAI response:", response);
      return null;
    }

    return {
      classification: classificationMatch[1].trim(),
      explanation: explanationMatch[1].trim(),
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const evalId = searchParams.get("evalId");

  if (!evalId) {
    return NextResponse.json(
      { error: "Missing evalId parameter" },
      { status: 400 }
    );
  }

  try {
    const startTime = Date.now();
    // Get the prompt evaluation
    const [evaluation] = await db
      .select()
      .from(promptEvaluations)
      .where(eq(promptEvaluations.id, parseInt(evalId)));

    if (!evaluation) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 }
      );
    }

    // Get all files with human labels
    const filesToEvaluate = await db
      .select()
      .from(files)
      .where(isNotNull(files.humanLabelId));

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME must be set");
    }

    // Process files in parallel
    const evaluationResults = await Promise.all(
      filesToEvaluate.map(async (file) => {
        try {
          // Get the human label for comparison
          const [humanLabel] = await db
            .select()
            .from(labels)
            .where(eq(labels.id, file.humanLabelId!));

          // Get the image data from S3
          const imageStream = await s3Client.getObject(
            bucketName,
            file.fileName
          );
          const chunks: Buffer[] = [];
          for await (const chunk of imageStream) {
            chunks.push(chunk);
          }
          const imageBuffer = Buffer.concat(chunks);
          const base64Image = imageBuffer.toString("base64");

          // Call OpenAI API with the image and prompt
          const response = await openai.chat.completions.create({
            model: ModelName,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: evaluation.finalPrompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${file.mimeType};base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1000,
          });

          // Extract and parse the AI's response
          const aiResponse = response.choices[0].message.content;
          const parsedResponse = parseOpenAIResponse(aiResponse || "");

          if (!parsedResponse) {
            console.error(`Failed to parse response for file ${file.id}`);
            return null;
          }

          // Create a new label for the AI's response
          const [newLabel] = await db
            .insert(labels)
            .values({
              name: parsedResponse.classification,
            })
            .returning();

          // Create eval result
          await db.insert(evalResults).values({
            fileId: file.id,
            promptEvalId: evaluation.id,
            llmLabelId: newLabel.id,
            llmReason: parsedResponse.explanation,
            result:
              parsedResponse.classification.toLowerCase() ===
              humanLabel.name.toLowerCase()
                ? EvalResult.CORRECT
                : EvalResult.INCORRECT,
          });

          // Return result for score calculation
          return {
            isCorrect:
              parsedResponse.classification.toLowerCase() ===
              humanLabel.name.toLowerCase(),
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

    // Update evaluation state to finished and set score
    await db
      .update(promptEvaluations)
      .set({
        state: PromptEvalState.FINISHED,
        score: score,
        duration: duration,
        analysisText: analysisText,
        numDataset: totalEvaluations,
      })
      .where(eq(promptEvaluations.id, evaluation.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in evaluation:", error);

    // Update evaluation state to failed if there's an error
    if (evalId) {
      await db
        .update(promptEvaluations)
        .set({
          state: PromptEvalState.FAILED,
          analysisText: `Evaluation failed: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`,
        })
        .where(eq(promptEvaluations.id, parseInt(evalId)));
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
