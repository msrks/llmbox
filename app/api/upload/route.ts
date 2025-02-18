import { NextRequest, NextResponse } from "next/server";
import { saveFileInBucket } from "@/lib/s3-file-management";
import { db } from "@/lib/db/drizzle";
import { files, Label } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadedFiles = formData.getAll("files");
    const label = formData.get("label");
    const projectId = formData.get("projectId");

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ error: "No files received" }, { status: 400 });
    }

    if (!label || (label !== Label.PASS && label !== Label.FAIL)) {
      return NextResponse.json(
        { error: "Valid label (pass/fail) is required" },
        { status: 400 }
      );
    }

    if (!projectId || isNaN(Number(projectId))) {
      return NextResponse.json(
        { error: "Valid projectId is required" },
        { status: 400 }
      );
    }

    const fileRecords = [];

    for (const file of uploadedFiles) {
      if (!(file instanceof File)) {
        continue;
      }

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Generate a unique filename
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
          projectId: Number(projectId),
          fileName,
          originalName: file.name,
          mimeType: file.type,
          size: buffer.length,
          humanLabel: label,
        })
        .returning();

      fileRecords.push(fileRecord);
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: fileRecords,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading files" },
      { status: 500 }
    );
  }
}

// Optional: Add size limit to the route
export const config = {
  api: {
    bodyParser: false,
  },
};
