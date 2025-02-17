"use server";

import { db } from "@/lib/db/drizzle";
import { files } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  generatePresignedUrl,
  deleteFileFromBucket,
} from "@/lib/s3-file-management";

export async function getFilesList() {
  try {
    const fileList = await db.query.files.findMany({
      orderBy: desc(files.createdAt),
      with: {
        humanLabel: true,
        aiLabel: true,
      },
    });

    return {
      files: fileList.map((file) => ({
        id: file.id,
        name: file.fileName,
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
