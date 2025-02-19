import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { files } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generatePresignedUrl } from "@/lib/s3-file-management";

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const file = await db
      .select()
      .from(files)
      .where(eq(files.id, parseInt(fileId)))
      .limit(1);

    if (!file || file.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: "S3_BUCKET_NAME must be set" },
        { status: 500 }
      );
    }

    const presignedUrl = await generatePresignedUrl(
      bucketName,
      file[0].fileName
    );
    return NextResponse.json({ url: presignedUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
