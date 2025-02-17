"use server";

import { db } from "@/lib/db/drizzle";
import { files, labels, type NewLabel } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  generatePresignedUrl,
  deleteFileFromBucket,
} from "@/lib/s3-file-management";

export async function getFilesList() {
  try {
    const fileList = await db
      .select()
      .from(files)
      .orderBy(desc(files.createdAt));
    return {
      files: fileList.map((file) => ({
        id: file.id,
        name: file.fileName,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        uploadType: file.uploadType,
        lastModified: file.createdAt,
      })),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to fetch files",
    };
  }
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

export async function getLabels() {
  try {
    const labelsList = await db
      .select()
      .from(labels)
      .orderBy(desc(labels.createdAt));
    return { labels: labelsList };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to fetch labels",
    };
  }
}

export async function createLabel(data: NewLabel) {
  try {
    const [newLabel] = await db.insert(labels).values(data).returning();
    return { label: newLabel };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create label",
    };
  }
}
