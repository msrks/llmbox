"use server";

import { db } from "@/lib/db/drizzle";
import { promptEvaluations } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEvaluation(formData: FormData) {
  try {
    const promptId = parseInt(formData.get("promptId") as string);
    const specId = parseInt(formData.get("specId") as string);

    if (!promptId || !specId) {
      throw new Error("Prompt and specification are required");
    }

    // Create the evaluation record
    await db.insert(promptEvaluations).values({
      promptId,
      specId,
      state: "running",
      createdAt: new Date(),
    });

    revalidatePath("/evaluation-results");
    redirect("/evaluation-results");
  } catch {
    return { error: "Failed to create evaluation" };
  }
}
