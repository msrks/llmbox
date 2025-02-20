import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { NewPromptTemplate, promptTemplates } from "../schema";

export async function createPromptTemplate(data: NewPromptTemplate) {
  return db.insert(promptTemplates).values(data).returning();
}

export async function getPromptTemplates(projectId: string) {
  return db.query.promptTemplates.findMany({
    where: eq(promptTemplates.projectId, parseInt(projectId)),
  });
}

export async function getPromptTemplate(promptTemplateId: string) {
  return db.query.promptTemplates.findFirst({
    where: eq(promptTemplates.id, parseInt(promptTemplateId)),
  });
}

export async function deletePromptTemplate(promptTemplateId: string) {
  return db
    .delete(promptTemplates)
    .where(eq(promptTemplates.id, parseInt(promptTemplateId)))
    .returning();
}
