"use server";

import { db } from "@/lib/db/drizzle";
import { projects } from "@/lib/db/schema";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function createProject(
  input: z.infer<typeof createProjectSchema>
) {
  const data = createProjectSchema.parse(input);

  const [newProject] = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description || null,
    })
    .returning({ id: projects.id });

  return newProject.id;
}

export async function getProjects() {
  const allProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
    })
    .from(projects)
    .orderBy(projects.name);

  return allProjects;
}

export async function handleNewProject(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Name is required" };
  }

  try {
    await createProject({ name, description });
    return { success: true };
  } catch {
    return { error: "Failed to create project" };
  }
}
