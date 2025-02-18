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
