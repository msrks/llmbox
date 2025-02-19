"use server";

// import { db } from "@/lib/db/drizzle";
// import { files } from "@/lib/db/schema";
import { generatePresignedUrl } from "@/lib/s3-file-management";
// import { eq } from "drizzle-orm";

// export async function getPresignedUrlByFileIdAction(fileId: number) {
//   const file = await db.query.files.findFirst({ where: eq(files.id, fileId) });
//   if (!file) throw new Error("File not found");

//   const bucketName = process.env.S3_BUCKET_NAME;
//   if (!bucketName) throw new Error("S3_BUCKET_NAME must be set");

//   return await generatePresignedUrl(bucketName, file.fileName);
// }

export async function getPresignedUrlByFileNameAction(fileName: string) {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) throw new Error("S3_BUCKET_NAME must be set");

  return await generatePresignedUrl(bucketName, fileName);
}
