"use server";

import {
  createPromptEvaluation,
  deletePromptEvaluation,
} from "@/lib/db/queries/promptEvaluations";
import { promptEvaluations } from "@/lib/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEvaluationForm(
  prevState: {
    error: string;
    promptTemplateId: string;
    inspectionSpecId: string;
  },
  formData: FormData
) {
  const result = createInsertSchema(promptEvaluations).safeParse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    promptTemplateId: Number(formData.get("promptTemplateId")),
    inspectionSpecId: Number(formData.get("inspectionSpecId")),
    projectId: Number(formData.get("projectId")),
  });

  if (!result.success) {
    return {
      error: result.error.errors[0].message,
      promptTemplateId: prevState.promptTemplateId,
      inspectionSpecId: prevState.inspectionSpecId,
    };
  }

  const evaluation = await createPromptEvaluation(result.data);
  redirect(`/${result.data.projectId}/evaluations/${evaluation[0].id}`);
}

export async function deleteEvaluationResultAction(id: string) {
  const deletedEvaluationResult = await deletePromptEvaluation(parseInt(id));
  revalidatePath(`/${deletedEvaluationResult[0].projectId}/evaluations`);
  return { success: true };
}
