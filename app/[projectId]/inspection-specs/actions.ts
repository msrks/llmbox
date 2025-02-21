"use server";

import { db } from "@/lib/db/drizzle";
import { inspectionSpecs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSpecs(projectId: string) {
  try {
    const allSpecs = await db
      .select()
      .from(inspectionSpecs)
      .where(eq(inspectionSpecs.projectId, parseInt(projectId)))
      .orderBy(desc(inspectionSpecs.createdAt));
    return { specs: allSpecs };
  } catch (error) {
    console.error("Failed to fetch specs:", error);
    throw new Error("Failed to fetch specifications");
  }
}

export async function createSpec(projectId: string, text: string) {
  try {
    if (!text) {
      throw new Error("Text is required");
    }

    const newSpec = await db
      .insert(inspectionSpecs)
      .values({
        projectId: parseInt(projectId),
        text,
      })
      .returning();

    revalidatePath(`/${projectId}/inspection-specs`);
    return { spec: newSpec[0] };
  } catch (error) {
    console.error("Failed to create spec:", error);
    throw new Error("Failed to create specification");
  }
}

export async function updateSpec(projectId: string, id: number, text: string) {
  try {
    if (!text) {
      throw new Error("Text is required");
    }

    await db
      .update(inspectionSpecs)
      .set({ text })
      .where(eq(inspectionSpecs.id, id));

    revalidatePath(`/${projectId}/inspection-specs`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update spec:", error);
    throw new Error("Failed to update specification");
  }
}

export async function deleteSpec(projectId: string, id: number) {
  try {
    await db.delete(inspectionSpecs).where(eq(inspectionSpecs.id, id));
    revalidatePath(`/${projectId}/inspection-specs`);
    console.log("Spec deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete spec:", error);
    throw new Error("Failed to delete specification");
  }
}
