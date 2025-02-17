import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEvaluation } from "./actions";
import { db } from "@/lib/db/drizzle";
import { llmPrompts, specs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

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
          <form action={createEvaluation} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="promptId">Prompt Template</Label>
              <Select name="promptId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a prompt template" />
                </SelectTrigger>
                <SelectContent>
                  {prompts.map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.id.toString()}>
                      {prompt.promptTemplate.length > 100
                        ? prompt.promptTemplate.substring(0, 100) + "..."
                        : prompt.promptTemplate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specId">Evaluation Specification</Label>
              <Select name="specId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select an evaluation specification" />
                </SelectTrigger>
                <SelectContent>
                  {specifications.map((spec) => (
                    <SelectItem key={spec.id} value={spec.id.toString()}>
                      {spec.description.length > 100
                        ? spec.description.substring(0, 100) + "..."
                        : spec.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Create Evaluation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
