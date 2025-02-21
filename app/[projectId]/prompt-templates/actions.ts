"use server";

import {
  createPromptTemplate,
  deletePromptTemplate,
} from "@/lib/db/queries/promptTemplates";
import { promptTemplates } from "@/lib/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPromptTemplateForm(formData: FormData) {
  const result = createInsertSchema(promptTemplates).safeParse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    text: formData.get("text"),
    projectId: Number(formData.get("projectId")),
  });

  if (!result.success) {
    throw new Error(result.error.errors[0].message);
  }

  await createPromptTemplate(result.data);
  redirect(`/${result.data.projectId}/prompt-templates`);
}

export async function deletePromptTemplateAction(id: string) {
  const deletedPromptTemplate = await deletePromptTemplate(id);
  revalidatePath(`/${deletedPromptTemplate[0].projectId}/prompt-templates`);
  return { success: true };
}
