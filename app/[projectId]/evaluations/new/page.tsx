import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";
import { promptTemplates, specs } from "@/lib/db/schema";
import { CreateEvaluationForm } from "./_components/create-evaluation-form";

export default async function NewEvaluationPage({
  params: { projectId },
}: {
  params: { projectId: string };
}) {
  const prompts = await db
    .select()
    .from(promptTemplates)
    .orderBy(desc(promptTemplates.createdAt));
  const specifications = await db
    .select()
    .from(specs)
    .orderBy(desc(specs.createdAt));

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Evaluation</CardTitle>
          <CardDescription>
            Create a new prompt evaluation to test and compare different prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateEvaluationForm
            prompts={prompts}
            specifications={specifications}
          />
        </CardContent>
      </Card>
    </div>
  );
}
