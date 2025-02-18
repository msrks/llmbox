import { db } from "@/lib/db/drizzle";
import { promptEvaluations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getEvaluationDetails(id: number) {
  try {
    const evaluation = await db.query.promptEvaluations.findFirst({
      where: eq(promptEvaluations.id, id),
      with: {
        prompt: true,
        spec: true,
        evalResults: {
          orderBy: (evalResults, { desc }) => [desc(evalResults.createdAt)],
        },
      },
    });

    if (!evaluation) {
      return { success: false, error: "Evaluation not found" };
    }

    return { success: true, data: evaluation };
  } catch {
    return { success: false, error: "Failed to fetch evaluation details" };
  }
}
