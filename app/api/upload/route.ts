import { NextRequest, NextResponse } from "next/server";
import { saveFileInBucket } from "@/lib/s3-file-management";
import { db } from "@/lib/db/drizzle";
import { files } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // You might want to validate file type/size here

    // Generate a unique filename - you could use the original name or generate a new one
    const fileName = `${Date.now()}-${file.name}`;

    // Save file to S3
    await saveFileInBucket({
      bucketName: process.env.S3_BUCKET_NAME || "default-bucket",
      fileName,
      file: buffer,
    });

    // Save file information to database
    const [fileRecord] = await db
      .insert(files)
      .values({
        fileName,
        originalName: file.name,
        mimeType: file.type,
        size: buffer.length,
      })
      .returning();

    return NextResponse.json({
      message: "File uploaded successfully",
      file: fileRecord,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}

// Optional: Add size limit to the route
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};
