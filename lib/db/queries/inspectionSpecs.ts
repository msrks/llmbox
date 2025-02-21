import { db } from "@/lib/db/drizzle";
import { eq } from "drizzle-orm";
import { inspectionSpecs, NewInspectionSpec } from "../schema";

export async function createInspectionSpec(data: NewInspectionSpec) {
  return db.insert(inspectionSpecs).values(data).returning();
}

export async function getInspectionSpecs(projectId: string) {
  return db.query.inspectionSpecs.findMany({
    where: eq(inspectionSpecs.projectId, parseInt(projectId)),
  });
}

export async function getInspectionSpec(inspectionSpecId: string) {
  return db.query.inspectionSpecs.findFirst({
    where: eq(inspectionSpecs.id, parseInt(inspectionSpecId)),
  });
}

export async function deleteInspectionSpec(inspectionSpecId: string) {
  return db
    .delete(inspectionSpecs)
    .where(eq(inspectionSpecs.id, parseInt(inspectionSpecId)))
    .returning();
}
