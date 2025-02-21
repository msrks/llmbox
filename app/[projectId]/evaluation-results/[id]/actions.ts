import { db } from "@/lib/db/drizzle";
import { promptEvaluations } from "@/lib/db/schema";
import { generatePresignedUrl } from "@/lib/s3-file-management";
import { eq } from "drizzle-orm";

export async function getEvaluationDetails(id: number) {
  try {
    const evaluation = await db.query.promptEvaluations.findFirst({
      where: eq(promptEvaluations.id, id),
      with: {
        prompt: true,
        spec: true,
        evalDetails: {
          with: {
            file: {
              with: {
                humanLabel: true,
              },
            },
            llmLabel: true,
          },
          orderBy: (evalDetails, { desc }) => [desc(evalDetails.createdAt)],
        },
      },
    });

    if (!evaluation) {
      return { success: false, error: "Evaluation not found" };
    }

    // Generate presigned URLs for all image files
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME must be set");
    }

    const previewUrls: Record<string, string> = {};
    for (const result of evaluation.evalDetails) {
      if (result.file.mimeType?.startsWith("image/")) {
        previewUrls[result.file.fileName] = await generatePresignedUrl(
          bucketName,
          result.file.fileName
        );
      }
    }

    return { success: true, data: { ...evaluation, previewUrls } };
  } catch {
    return { success: false, error: "Failed to fetch evaluation details" };
  }
}
