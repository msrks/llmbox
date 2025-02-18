"use server";

import { db } from "@/lib/db/drizzle";
import { llmPrompts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPrompts(projectId: string) {
  try {
    const prompts = await db
      .select()
      .from(llmPrompts)
      .where(eq(llmPrompts.projectId, projectId))
      .orderBy(desc(llmPrompts.createdAt));
    return { prompts };
  } catch (error) {
    console.error("Failed to fetch prompts:", error);
    throw new Error("Failed to fetch prompts");
  }
}

export async function createPrompt(promptTemplate: string, projectId: string) {
  try {
    if (!promptTemplate) {
      throw new Error("Prompt template is required");
    }

    const [newPrompt] = await db
      .insert(llmPrompts)
      .values({ promptTemplate, projectId })
      .returning();

    revalidatePath(`/${projectId}/prompts`);
    return { prompt: newPrompt };
  } catch (error) {
    console.error("Failed to create prompt:", error);
    throw new Error("Failed to create prompt");
  }
}

export async function deletePrompt(id: number, projectId: string) {
  try {
    await db.delete(llmPrompts).where(eq(llmPrompts.id, id));
    revalidatePath(`/${projectId}/prompts`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete prompt:", error);
    throw new Error("Failed to delete prompt");
  }
}
