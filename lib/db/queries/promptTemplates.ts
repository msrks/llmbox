import { db } from "@/lib/db/drizzle";
import { eq } from "drizzle-orm";
import { NewPromptTemplate, promptTemplates } from "../schema";

export async function createPromptTemplate(data: NewPromptTemplate) {
  return db.insert(promptTemplates).values(data).returning();
}

export async function getPromptTemplates(projectId: number) {
  return db.query.promptTemplates.findMany({
    where: eq(promptTemplates.projectId, projectId),
  });
}

export async function getPromptTemplate(id: number) {
  return db.query.promptTemplates.findFirst({
    where: eq(promptTemplates.id, id),
  });
}

export async function deletePromptTemplate(id: number) {
  return db
    .delete(promptTemplates)
    .where(eq(promptTemplates.id, id))
    .returning();
}
