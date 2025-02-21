"use server";

import {
  createInspectionSpec,
  deleteInspectionSpec,
} from "@/lib/db/queries/inspectionSpecs";
import { inspectionSpecs } from "@/lib/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createInspectionSpecForm(
  prevState: {
    error: string;
    text: string;
  },
  formData: FormData
) {
  const result = createInsertSchema(inspectionSpecs).safeParse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    text: formData.get("text"),
    projectId: Number(formData.get("projectId")),
  });

  if (!result.success) {
    return {
      error: result.error.errors[0].message,
      text: prevState.text,
    };
  }

  await createInspectionSpec(result.data);
  redirect(`/${result.data.projectId}/inspection-specs`);
}

export async function deleteInspectionSpecAction(id: string) {
  const deletedInspectionSpec = await deleteInspectionSpec(id);
  revalidatePath(`/${deletedInspectionSpec[0].projectId}/inspection-specs`);
  return { success: true };
}
