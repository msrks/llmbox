"use server";

import { db } from "@/lib/db/drizzle";
import { labels, type NewLabel } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getLabels() {
  try {
    const labelsList = await db
      .select()
      .from(labels)
      .orderBy(desc(labels.createdAt));
    return { labels: labelsList };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to fetch labels",
    };
  }
}

export async function createLabel(data: NewLabel) {
  try {
    const [newLabel] = await db.insert(labels).values(data).returning();
    return { label: newLabel };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create label",
    };
  }
}

export async function updateLabel(id: number, data: NewLabel) {
  try {
    const [updatedLabel] = await db
      .update(labels)
      .set(data)
      .where(eq(labels.id, id))
      .returning();
    return { label: updatedLabel };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update label",
    };
  }
}

export async function deleteLabel(id: number) {
  try {
    await db.delete(labels).where(eq(labels.id, id));
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete label",
    };
  }
}
