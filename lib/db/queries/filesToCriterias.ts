import { db } from "@/lib/db/drizzle";
import { filesToCriterias, NewFileToCriteria } from "@/lib/db/schema";

export async function upsertFileToCriteria(data: NewFileToCriteria) {
  return db
    .insert(filesToCriterias)
    .values(data)
    .onConflictDoUpdate({
      target: [filesToCriterias.fileId, filesToCriterias.criteriaId],
      set: data,
    });
}
