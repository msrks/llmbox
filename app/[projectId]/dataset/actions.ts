"use server";

import { db } from "@/lib/db/drizzle";
import { files, filesToCriterias, criterias } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  generatePresignedUrl,
  deleteFileFromBucket,
} from "@/lib/s3-file-management";

export async function getFilesList(projectId: string) {
  try {
    const fileList = await db
      .select()
      .from(files)
      .where(eq(files.projectId, parseInt(projectId)))
      .orderBy(desc(files.createdAt));

    return {
      files: fileList.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        uploadType: file.uploadType,
        lastModified: file.createdAt,
        humanLabel: file.humanLabel,
        aiLabel: file.aiLabel,
      })),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to fetch files",
    };
  }
}

export async function getCriterias(projectId: string) {
  try {
    const criteriasList = await db
      .select()
      .from(criterias)
      .where(eq(criterias.projectId, parseInt(projectId)));
    return { criterias: criteriasList };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch criterias",
    };
  }
}

export async function createCriteriaExample(data: {
  fileId: number;
  criteriaId: number;
  isFail: boolean;
  reason?: string;
}) {
  return db.insert(filesToCriterias).values(data).returning();
}

export async function getFileDownloadUrl(fileId: number) {
  try {
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

    const presignedUrl = await generatePresignedUrl(
      bucketName,
      file[0].fileName
    );
    return { url: presignedUrl };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate download URL",
    };
  }
}

export async function getFilePreviewUrl(fileId: number) {
  try {
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

    const presignedUrl = await generatePresignedUrl(
      bucketName,
      file[0].fileName
    );
    return { url: presignedUrl };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate preview URL",
    };
  }
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

export async function getCriteriaExamples(fileId: number) {
  return db
    .select({
      fileId: filesToCriterias.fileId,
      criteriaId: filesToCriterias.criteriaId,
      isFail: filesToCriterias.isFail,
      reason: filesToCriterias.reason,
      name: criterias.name,
      description: criterias.description,
    })
    .from(filesToCriterias)
    .innerJoin(criterias, eq(filesToCriterias.criteriaId, criterias.id))
    .where(eq(filesToCriterias.fileId, fileId));
}
