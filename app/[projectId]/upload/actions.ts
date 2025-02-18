import { Label } from "@/lib/db/schema";

export async function uploadImages(formData: FormData, projectId: string) {
  try {
    const label = formData.get("label") as Label;
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    if (!label) {
      throw new Error("Label is required");
    }

    // TODO: Implement your file storage logic here
    // For example, using AWS S3, or local storage

    return { success: true };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
