"use server";

import { db } from "@/lib/db/drizzle";
import { llmPrompts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPrompts() {
  try {
    const prompts = await db
      .select()
      .from(llmPrompts)
      .orderBy(desc(llmPrompts.createdAt));
    return { prompts };
  } catch (error) {
    console.error("Failed to fetch prompts:", error);
    throw new Error("Failed to fetch prompts");
  }
}

export async function createPrompt(promptTemplate: string) {
  try {
    if (!promptTemplate) {
      throw new Error("Prompt template is required");
    }

    const [newPrompt] = await db
      .insert(llmPrompts)
      .values({ promptTemplate })
      .returning();

    revalidatePath("/prompts");
    return { prompt: newPrompt };
  } catch (error) {
    console.error("Failed to create prompt:", error);
    throw new Error("Failed to create prompt");
  }
}
