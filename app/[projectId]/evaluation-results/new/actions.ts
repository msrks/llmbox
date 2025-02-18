"use server";

import { db } from "@/lib/db/drizzle";
import { labels, llmPrompts, promptEvaluations, specs } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createEvaluation(formData: FormData) {
  try {
    const promptId = parseInt(formData.get("promptId") as string);
    const specId = parseInt(formData.get("specId") as string);

    if (!promptId || !specId) {
      return { error: "Prompt and specification are required" };
    }

    // Fetch the prompt template
    const promptTemplate = await db
      .select()
      .from(llmPrompts)
      .where(eq(llmPrompts.id, promptId))
      .then((rows) => rows[0]?.promptTemplate);

    if (!promptTemplate) {
      return { error: "Prompt template not found" };
    }

    // Fetch the specification
    const specification = await db
      .select()
      .from(specs)
      .where(eq(specs.id, specId))
      .then((rows) => rows[0]?.description);

    if (!specification) {
      return { error: "Specification not found" };
    }

    // Fetch all labels
    const allLabels = await db.select().from(labels);
    const labelsList = allLabels.map((label) => label.name).join(", ");

    // Generate the final prompt by replacing placeholders
    const finalPrompt = promptTemplate
      .replace("{{INSPECTION_SPEC}}", specification)
      .replace("{{LABELS}}", labelsList);

    // Create the evaluation record
    const [newEvaluation] = await db
      .insert(promptEvaluations)
      .values({
        promptId,
        specId,
        finalPrompt,
        state: "running",
        createdAt: new Date(),
      })
      .returning();

    // Trigger the evaluation task
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/evaluate?evalId=${newEvaluation.id}`,
        {
          method: "GET",
        }
      );
    } catch (error) {
      console.error("Failed to trigger evaluation task:", error);
      // We don't return an error here since the evaluation was created successfully
      // The task can be retried later if needed
    }

    revalidatePath("/evaluation-results");
    return { success: true };
  } catch (error) {
    console.error("Failed to create evaluation:", error);
    return { error: "Failed to create evaluation" };
  }
}
