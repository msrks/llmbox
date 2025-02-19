"use server";

import { db } from "@/lib/db/drizzle";
import {
  files,
  filesToCriterias,
  criterias,
  NewFileToCriteria,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { deleteFileFromBucket } from "@/lib/s3-file-management";

export async function upsertFileToCriteria(data: NewFileToCriteria) {
  return db
    .insert(filesToCriterias)
    .values(data)
    .onConflictDoUpdate({
      target: [filesToCriterias.fileId, filesToCriterias.criteriaId],
      set: data,
    });
}

export async function deleteFile(fileId: number) {
  try {
    // First, get the file information
    const file = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (!file || file.length === 0) {
      throw new Error("File not found");
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME must be set");
    }

    // Delete from S3
    await deleteFileFromBucket(bucketName, file[0].fileName);

    // Delete from database
    await db.delete(files).where(eq(files.id, fileId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}

export async function getFilesList(projectId: string) {
  return db.query.files.findMany({
    where: eq(files.projectId, parseInt(projectId)),
    orderBy: desc(files.createdAt),
  });
}

export async function getFileWithCriterias(fileId: number) {
  return db.query.filesToCriterias.findMany({
    where: eq(filesToCriterias.fileId, fileId),
    with: { criteria: true },
  });
}

export async function getFilesWithCriterias(projectId: string) {
  return db.query.files.findMany({
    where: eq(files.projectId, parseInt(projectId)),
    with: { filesToCriterias: { with: { criteria: true } } },
  });
}

export async function getCriterias(projectId: string) {
  return db.query.criterias.findMany({
    where: eq(criterias.projectId, parseInt(projectId)),
  });
}

export type FileWithCriterias = Awaited<
  ReturnType<typeof getFileWithCriterias>
>;

export type FilesWithCriterias = Awaited<
  ReturnType<typeof getFilesWithCriterias>
>;
