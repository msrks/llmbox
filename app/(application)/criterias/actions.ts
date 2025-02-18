"use server";

import { db } from "@/lib/db/drizzle";
import { criterias, type NewCriteria } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getCriterias() {
  try {
    const criteriasList = await db
      .select()
      .from(criterias)
      .orderBy(desc(criterias.createdAt));
    return { criterias: criteriasList };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch criterias",
    };
  }
}

export async function createCriteria(data: NewCriteria) {
  try {
    const [newCriteria] = await db.insert(criterias).values(data).returning();
    return { criteria: newCriteria };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create criteria",
    };
  }
}

export async function updateCriteria(id: number, data: NewCriteria) {
  try {
    const [updatedCriteria] = await db
      .update(criterias)
      .set(data)
      .where(eq(criterias.id, id))
      .returning();
    return { criteria: updatedCriteria };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to update criteria",
    };
  }
}

export async function deleteCriteria(id: number) {
  try {
    await db.delete(criterias).where(eq(criterias.id, id));
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete criteria",
    };
  }
}
