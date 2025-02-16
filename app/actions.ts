"use server";

import { db } from "@/lib/db/drizzle";
import { files } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function getFilesList() {
  try {
    const fileList = await db
      .select()
      .from(files)
      .orderBy(desc(files.createdAt));
    return {
      files: fileList.map((file) => ({
        name: file.fileName,
        originalName: file.originalName,
        size: file.size,
        lastModified: file.createdAt,
      })),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to fetch files",
    };
  }
}
