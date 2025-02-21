import { db } from "@/lib/db/drizzle";
import { NewPromptEvaluation, promptEvaluations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createPromptEvaluation(data: NewPromptEvaluation) {
  return db.insert(promptEvaluations).values(data).returning();
}

export async function getPromptEvaluations(projectId: number) {
  return db.query.promptEvaluations.findMany({
    where: eq(promptEvaluations.projectId, projectId),
  });
}

export async function getPromptEvaluation(id: number) {
  return db.query.promptEvaluations.findFirst({
    where: eq(promptEvaluations.id, id),
  });
}

export async function getPromptEvaluationWithDetails(id: number) {
  return db.query.promptEvaluations.findFirst({
    where: eq(promptEvaluations.id, id),
    with: {
      evalDetails: {
        with: {
          file: {
            with: {
              filesToCriterias: {
                with: {
                  criteria: true,
                },
              },
            },
          },
        },
        orderBy: (evalDetails, { desc }) => [desc(evalDetails.createdAt)],
      },
    },
  });
}

export async function deletePromptEvaluation(id: number) {
  return db
    .delete(promptEvaluations)
    .where(eq(promptEvaluations.id, id))
    .returning();
}
