"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEvaluation } from "../actions";
import { llmPrompts, specs } from "@/lib/db/schema";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface CreateEvaluationFormProps {
  prompts: (typeof llmPrompts.$inferSelect)[];
  specifications: (typeof specs.$inferSelect)[];
}

export function CreateEvaluationForm({
  prompts,
  specifications,
}: CreateEvaluationFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  async function clientAction(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await createEvaluation(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Evaluation created successfully");
          router.push(`/${projectId}/evaluation-results`);
          router.refresh();
        }
      } catch {
        toast.error("Failed to create evaluation");
      }
    });
  }

  return (
    <form action={clientAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="promptId">Prompt Template</Label>
        <Select name="promptId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a prompt template" />
          </SelectTrigger>
          <SelectContent>
            {prompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.id.toString()}>
                {prompt.promptTemplate.substring(0, 100)}
                {prompt.promptTemplate.length > 100 ? "..." : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="specId">Specification</Label>
        <Select name="specId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a specification" />
          </SelectTrigger>
          <SelectContent>
            {specifications.map((spec) => (
              <SelectItem key={spec.id} value={spec.id.toString()}>
                {spec.description.substring(0, 100)}
                {spec.description.length > 100 ? "..." : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Evaluation"}
      </Button>
    </form>
  );
}
