"use server";

import { deleteCriteria, upsertCriteria } from "@/lib/db/queries/criterias";
import { criterias } from "@/lib/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteCriteriaAction(id: string) {
  const deletedCriteria = await deleteCriteria(id);
  revalidatePath(`/${deletedCriteria[0].projectId}/criterias`);
  return { success: true };
}

export async function upsertCriteriaForm(
  prevState: { error: string; name: string; description: string },
  formData: FormData
) {
  const result = createInsertSchema(criterias).safeParse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    projectId: Number(formData.get("projectId")),
  });

  if (!result.success) {
    return {
      error: result.error.errors[0].message,
      name: prevState.name,
      description: prevState.description,
    };
  }

  await upsertCriteria(result.data);
  redirect(`/${result.data.projectId}/criterias`);
}
