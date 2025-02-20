import { db } from "@/lib/db/drizzle";
import { criterias, NewCriteria } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function upsertCriteria(data: NewCriteria) {
  return db
    .insert(criterias)
    .values(data)
    .onConflictDoUpdate({ target: [criterias.id], set: data });
}

export async function deleteCriteria(criteriaId: string) {
  return db
    .delete(criterias)
    .where(eq(criterias.id, parseInt(criteriaId)))
    .returning();
}

export async function getCriteria(criteriaId: string) {
  return db.query.criterias.findFirst({
    where: eq(criterias.id, parseInt(criteriaId)),
  });
}

export async function getCriteriaByIdWithFiles(criteriaId: string) {
  return db.query.criterias.findFirst({
    where: eq(criterias.id, parseInt(criteriaId)),
    with: { filesToCriterias: { with: { file: true } } },
  });
}

export type CriteriaWithFiles = Awaited<
  ReturnType<typeof getCriteriaByIdWithFiles>
>;

export async function getCriterias(projectId: string) {
  return db.query.criterias.findMany({
    where: eq(criterias.projectId, parseInt(projectId)),
  });
}
