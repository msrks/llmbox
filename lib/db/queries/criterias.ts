import { db } from "@/lib/db/drizzle";
import { criterias, NewCriteria } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function upsertCriteria(data: NewCriteria) {
  return db
    .insert(criterias)
    .values(data)
    .onConflictDoUpdate({ target: [criterias.id], set: data });
}

export async function deleteCriteria(id: number) {
  return db.delete(criterias).where(eq(criterias.id, id)).returning();
}

export async function getCriteria(id: number) {
  return db.query.criterias.findFirst({
    where: eq(criterias.id, id),
  });
}

export async function getCriteriaByIdWithFiles(id: number) {
  return db.query.criterias.findFirst({
    where: eq(criterias.id, id),
    with: { filesToCriterias: { with: { file: true } } },
  });
}

export type CriteriaWithFiles = Awaited<
  ReturnType<typeof getCriteriaByIdWithFiles>
>;

export async function getCriterias(projectId: number) {
  return db.query.criterias.findMany({
    where: eq(criterias.projectId, projectId),
  });
}
