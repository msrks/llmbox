import { db } from "@/lib/db/drizzle";
import { eq } from "drizzle-orm";
import { inspectionSpecs, NewInspectionSpec } from "../schema";

export async function createInspectionSpec(data: NewInspectionSpec) {
  return db.insert(inspectionSpecs).values(data).returning();
}

export async function getInspectionSpecs(projectId: number) {
  return db.query.inspectionSpecs.findMany({
    where: eq(inspectionSpecs.projectId, projectId),
  });
}

export async function getInspectionSpec(id: number) {
  return db.query.inspectionSpecs.findFirst({
    where: eq(inspectionSpecs.id, id),
  });
}

export async function deleteInspectionSpec(id: number) {
  return db
    .delete(inspectionSpecs)
    .where(eq(inspectionSpecs.id, id))
    .returning();
}
