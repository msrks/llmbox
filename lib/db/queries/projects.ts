import { db } from "@/lib/db/drizzle";
import { projects, NewProject, Project } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { files } from "@/lib/db/schema";
import { llmPrompts } from "@/lib/db/schema";
import { promptEvaluations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createProject(data: NewProject) {
  return db.insert(projects).values(data).returning();
}

export async function updateProject(projectId: number, data: Partial<Project>) {
  return db.update(projects).set(data).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  return db.delete(projects).where(eq(projects.id, projectId));
}

export async function getProject(projectId: number) {
  return db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
}

export async function getProjectWithStats(projectId: number) {
  const project = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project.length) {
    return null;
  }

  // Get counts of related items
  const [fileCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(files)
    .where(eq(files.projectId, projectId));

  const [promptCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(llmPrompts)
    .where(eq(llmPrompts.projectId, projectId));

  const [evalCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(promptEvaluations)
    .where(eq(promptEvaluations.projectId, projectId));

  return {
    ...project[0],
    stats: {
      files: fileCount?.count ?? 0,
      prompts: promptCount?.count ?? 0,
      evaluations: evalCount?.count ?? 0,
    },
  };
}
