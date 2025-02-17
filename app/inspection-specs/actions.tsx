"use server";

import { db } from "@/lib/db/drizzle";
import { specs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSpecs() {
  try {
    const allSpecs = await db
      .select()
      .from(specs)
      .orderBy(desc(specs.createdAt));
    return { specs: allSpecs };
  } catch (error) {
    console.error("Failed to fetch specs:", error);
    throw new Error("Failed to fetch specifications");
  }
}

export async function createSpec(description: string) {
  try {
    if (!description) {
      throw new Error("Description is required");
    }

    const newSpec = await db
      .insert(specs)
      .values({
        description,
      })
      .returning();

    revalidatePath("/inspection-specs");
    return { spec: newSpec[0] };
  } catch (error) {
    console.error("Failed to create spec:", error);
    throw new Error("Failed to create specification");
  }
}

export async function updateSpec(id: number, description: string) {
  try {
    if (!description) {
      throw new Error("Description is required");
    }

    await db
      .update(specs)
      .set({ description })
      .where(({ eq }) => eq(specs.id, id));

    revalidatePath("/inspection-specs");
    return { success: true };
  } catch (error) {
    console.error("Failed to update spec:", error);
    throw new Error("Failed to update specification");
  }
}

export async function deleteSpec(id: number) {
  try {
    await db.delete(specs).where(({ eq }) => eq(specs.id, id));
    revalidatePath("/inspection-specs");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete spec:", error);
    throw new Error("Failed to delete specification");
  }
}
