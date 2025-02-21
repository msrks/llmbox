"use server";

import { createProject, deleteProject } from "@/lib/db/queries/projects";
import { projects } from "@/lib/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

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

export async function deleteProjectAction(formData: FormData) {
  const result = z
    .object({
      projectId: z.string(),
    })
    .safeParse({
      projectId: formData.get("projectId"),
    });

  if (!result.success) {
    toast.error(result.error.errors[0].message);
    return;
  }

  await deleteProject(parseInt(result.data.projectId));
  redirect(`/projects`);
}
