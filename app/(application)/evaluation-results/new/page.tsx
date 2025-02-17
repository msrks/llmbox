import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db/drizzle";
import { llmPrompts, specs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { CreateEvaluationForm } from "./_components/create-evaluation-form";

export default async function NewEvaluationPage() {
  const prompts = await db
    .select()
    .from(llmPrompts)
    .orderBy(desc(llmPrompts.createdAt));
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
