import { db } from "@/lib/db/drizzle";
import { files, filesToCriterias, NewFileToCriteria } from "@/lib/db/schema";
import {
  deleteFileFromBucket,
  generatePresignedUrl,
} from "@/lib/s3-file-management";
import { and, desc, eq, isNotNull } from "drizzle-orm";

export async function upsertFileToCriteria(data: NewFileToCriteria) {
  return db
    .insert(filesToCriterias)
    .values(data)
    .onConflictDoUpdate({
      target: [filesToCriterias.fileId, filesToCriterias.criteriaId],
      set: data,
    });
}

export async function deleteFile(id: number, fileName: string) {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) throw new Error("S3_BUCKET_NAME must be set");
  await deleteFileFromBucket(bucketName, fileName);
  await db.delete(files).where(eq(files.id, id));
  return { success: true };
}

export async function getFilesList(projectId: number) {
  return db.query.files.findMany({
    where: eq(files.projectId, projectId),
    orderBy: desc(files.createdAt),
  });
}

export async function getFileWithCriterias(id: number) {
  const file = await db.query.files.findFirst({
    where: eq(files.id, id),
    with: { filesToCriterias: { with: { criteria: true } } },
  });
  if (!file) throw new Error("File not found");
  return file;
}

export async function getPresignedUrl(fileId: number) {
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

  const presignedUrl = await generatePresignedUrl(bucketName, file[0].fileName);
  return presignedUrl;
}

export async function getFilesWithCriterias(projectId: number) {
  return db.query.files.findMany({
    where: eq(files.projectId, projectId),
    with: { filesToCriterias: { with: { criteria: true } } },
  });
}

export async function getFilesForEvaluation(projectId: number) {
  return db
    .select()
    .from(files)
    .where(and(eq(files.projectId, projectId), isNotNull(files.humanLabel)));
}

export type FileWithCriterias = Awaited<
  ReturnType<typeof getFileWithCriterias>
>;
