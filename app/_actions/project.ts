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
