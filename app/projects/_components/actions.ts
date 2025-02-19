"use server";

import { projects } from "@/lib/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { createProject } from "@/lib/db/queries/projects";
import { deleteProject } from "@/lib/db/queries/projects";

export async function createProjectAction(formData: FormData) {
  const result = createInsertSchema(projects).safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!result.success) {
    toast.error(result.error.errors[0].message);
    return;
  }

  const newProjects = await createProject(result.data);
  redirect(`/${newProjects[0].id}`);
}

export async function deleteProjectAction(projectId: number) {
  try {
    await deleteProject(projectId);
    redirect(`/projects`);
  } catch {
    toast.error("Failed to delete project");
  }
}
