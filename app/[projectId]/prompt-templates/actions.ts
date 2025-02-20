"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { promptTemplates } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getPrompts(projectId: number) {
  return await db
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.projectId, projectId))
    .orderBy(desc(promptTemplates.createdAt));
}

export async function createPrompt(
  projectId: number,
  text: string,
  path: string
) {
  try {
    await db.insert(promptTemplates).values({
      projectId,
      text,
    });
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deletePrompt(id: number, path: string) {
  try {
    await db.delete(promptTemplates).where(eq(promptTemplates.id, id));
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
