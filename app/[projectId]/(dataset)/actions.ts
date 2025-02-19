"use server";

import { NewFileToCriteria } from "@/lib/db/schema";
import { upsertFileToCriteria, deleteFile } from "@/lib/db/queries/files";
import { getCriterias } from "@/lib/db/queries/criterias";

export async function upsertFileToCriteriaAction(data: NewFileToCriteria) {
  return upsertFileToCriteria(data);
}

export async function deleteFileAction(fileId: number, fileName: string) {
  return deleteFile(fileId, fileName);
}

export async function getCriteriasAction(projectId: string) {
  return getCriterias(projectId);
}
