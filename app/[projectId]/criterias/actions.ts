"use server";

import {
  createCriteria,
  deleteCriteria,
  updateCriteria,
} from "@/lib/db/queries/criterias";
import { createInsertSchema } from "drizzle-zod";
import { criterias } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
export async function updateCriteriaAction(formData: FormData) {
  const result = createInsertSchema(criterias).safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!result.success) throw new Error(result.error.errors[0].message);
  await updateCriteria(formData.get("id") as string, result.data);
}

export async function deleteCriteriaAction(formData: FormData) {
  const id = formData.get("id");
  if (!id) throw new Error("ID is required");
  await deleteCriteria(id.toString());
}

export async function createCriteriaAction(formData: FormData) {
  const result = createInsertSchema(criterias).safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    projectId: Number(formData.get("projectId")),
  });

  if (!result.success) {
    throw new Error(result.error.errors[0].message);
  }

  await createCriteria(result.data);
  revalidatePath(`/projects/${result.data.projectId}/criterias`);
}
