"use server";

import { deleteCriteria, upsertCriteria } from "@/lib/db/queries/criterias";
import { createInsertSchema } from "drizzle-zod";
import { criterias } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteCriteriaAction(id: string) {
  const deletedCriteria = await deleteCriteria(id);
  revalidatePath(`/${deletedCriteria[0].projectId}/criterias`);
  return { success: true };
}

export async function upsertCriteriaAction(formData: FormData) {
  const result = createInsertSchema(criterias).safeParse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    projectId: Number(formData.get("projectId")),
  });

  if (!result.success) {
    throw new Error(result.error.errors[0].message);
  }

  await upsertCriteria(result.data);
  redirect(`/${result.data.projectId}/criterias`);
}
