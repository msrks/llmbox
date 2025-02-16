import ollama from "ollama";
import { z } from "zod";
import { saveFileInBucket } from "@/lib/s3-file-management";
import { db } from "@/lib/db/drizzle";
import { files } from "@/lib/db/schema";
import { after } from "next/server";

export async function POST(req: Request) {
  const { image } = await req.json();

  // Validate that the image is a properly formatted base64 data URI
  const base64Regex = /^data:image\/(jpeg|png|gif);base64,/;
  const imageData = z.string().regex(base64Regex).safeParse(image);

  if (!imageData.success) {
    return new Response("Invalid image format. Expected base64 data URI.", {
      status: 400,
    });
  }

  // Extract the actual base64 data by removing the data URI prefix
  const base64Content = image.split(",")[1];

  // Get Ollama inference
  const response = await ollama.chat({
    model: "llama3.2-vision:11b",
    messages: [
      {
        role: "user",
        content: "What is in this image?",
        images: [base64Content],
      },
    ],
  });

  // Handle storage after returning response
  after(async () => {
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Content, "base64");

      // Generate a unique filename
      const fileName = `vision-${Date.now()}.jpg`;

      // Save file to S3
      await saveFileInBucket({
        bucketName: process.env.S3_BUCKET_NAME || "default-bucket",
        fileName,
        file: buffer,
      });

      // Save file information to database
      await db.insert(files).values({
        fileName,
        originalName: fileName,
        mimeType: "image/jpeg",
        size: buffer.length,
      });

      console.log("Image saved successfully:", fileName);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  });

  // Return inference response immediately
  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
