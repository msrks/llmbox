"use server";

import {
  createCriteria,
  deleteCriteria,
  updateCriteria,
} from "@/lib/db/queries/criterias";
import { toast } from "sonner";
import { createInsertSchema } from "drizzle-zod";
import { criterias } from "@/lib/db/schema";

export async function updateCriteriaAction(formData: FormData) {
  const result = createInsertSchema(criterias).safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!result.success) {
    toast.error(result.error.errors[0].message);
    return;
  }

  await updateCriteria(formData.get("id") as string, result.data);
  toast.success("Criteria updated successfully");
}

export async function deleteCriteriaAction(formData: FormData) {
  const id = formData.get("id");
  if (!id) {
    toast.error("ID is required");
    return;
  }
  await deleteCriteria(id.toString());
  toast.success("Criteria deleted successfully");
}

export async function createCriteriaAction(formData: FormData) {
  const result = createInsertSchema(criterias).safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!result.success) {
    toast.error(result.error.errors[0].message);
    return;
  }

  await createCriteria(result.data);
  toast.success("Criteria created successfully");
}
