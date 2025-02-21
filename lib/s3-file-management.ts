import dotenv from "dotenv";
import * as Minio from "minio";

dotenv.config();

if (
  !process.env.S3_ENDPOINT ||
  !process.env.S3_ACCESS_KEY ||
  !process.env.S3_SECRET_KEY
) {
  throw new Error("S3_ENDPOINT, S3_ACCESS_KEY, and S3_SECRET_KEY must be set");
}

// Create a new Minio client with the S3 endpoint, access key, and secret key
export const s3Client = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT,
  port: process.env.S3_PORT ? Number(process.env.S3_PORT) : undefined,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
  useSSL: process.env.S3_USE_SSL === "true",
});

export async function createBucketIfNotExists(bucketName: string) {
  const bucketExists = await s3Client.bucketExists(bucketName);
  if (!bucketExists) {
    await s3Client.makeBucket(bucketName);
  }
}

export async function saveFileInBucket({
  bucketName,
  fileName,
  file,
}: {
  bucketName: string;
  fileName: string;
  file: Buffer;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  // check if file exists - optional.
  // Without this check, the file will be overwritten if it exists
  const fileExists = await checkFileExistsInBucket({
    bucketName,
    fileName,
  });

  if (fileExists) {
    throw new Error("File already exists");
  }

  // Upload image to S3 bucket
  await s3Client.putObject(bucketName, fileName, file);
}

export async function checkFileExistsInBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    await s3Client.statObject(bucketName, fileName);
  } catch {
    return false;
  }
  return true;
}

export async function listFilesInBucket(bucketName: string) {
  const fileList: { name: string; size: number; lastModified: Date }[] = [];

  const stream = s3Client.listObjects(bucketName);

  for await (const file of stream) {
    if (file.name && file.size && file.lastModified) {
      fileList.push({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      });
    }
  }

  return fileList;
}

export async function generatePresignedUrl(
  bucketName: string,
  fileName: string
) {
  try {
    // Generate presigned URL that expires in 1 hour (3600 seconds)
    const presignedUrl = await s3Client.presignedGetObject(
      bucketName,
      fileName,
      3600
    );
    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}

export async function deleteFileFromBucket(
  bucketName: string,
  fileName: string
) {
  try {
    await s3Client.removeObject(bucketName, fileName);
    return true;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
}

export function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
