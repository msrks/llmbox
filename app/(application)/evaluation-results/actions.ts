"use server";

import { db } from "@/lib/db/drizzle";
import { promptEvaluations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function deleteEvaluationResult(id: number) {
  try {
    await db.delete(promptEvaluations).where(eq(promptEvaluations.id, id));
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete evaluation result" };
  }
}

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
