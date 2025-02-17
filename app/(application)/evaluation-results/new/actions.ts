"use server";

import { db } from "@/lib/db/drizzle";
import { promptEvaluations } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export async function createEvaluation(formData: FormData) {
  try {
    const promptId = parseInt(formData.get("promptId") as string);
    const specId = parseInt(formData.get("specId") as string);
    const score = parseFloat(formData.get("score") as string);

    if (!promptId || !specId || isNaN(score)) {
      throw new Error("All fields are required");
    }

    // Create the evaluation record
    await db.insert(promptEvaluations).values({
      promptId,
      specId,
      score,
      state: "running",
      createdAt: new Date(),
    });

    revalidatePath("/evaluation-results");
    redirect("/evaluation-results");
  } catch (error) {
    toast.error("Failed to create evaluation");
    throw error;
  }
}
