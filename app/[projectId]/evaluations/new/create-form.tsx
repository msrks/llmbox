"use client";

import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InspectionSpec, PromptTemplate } from "@/lib/db/schema";
import Form from "next/form";
import Link from "next/link";
import { useActionState } from "react";
import { createEvaluationForm } from "../actions";

export default function CreateForm({
  projectId,
  promptTemplates,
  inspectionSpecs,
}: {
  projectId: string;
  promptTemplates: PromptTemplate[];
  inspectionSpecs: InspectionSpec[];
}) {
  const [state, formAction, isPending] = useActionState(createEvaluationForm, {
    error: "",
    promptTemplateId: "",
    inspectionSpecId: "",
  });

  return (
    <div className="w-full mx-auto space-y-4">
      <div className="flex flex-row items-center justify-between">
        <PageTitle>New Prompt Template</PageTitle>
      </div>
      <Form action={formAction} className="h-[calc(100vh-12rem)]">
        <div className="space-y-4 h-full">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-2">
            <Label htmlFor="promptTemplateId">Prompt Template</Label>
            <Select name="promptTemplateId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a prompt template" />
              </SelectTrigger>
              <SelectContent>
                {promptTemplates.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id.toString()}>
                    {prompt.text.substring(0, 100)}
                    {prompt.text.length > 100 ? "..." : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inspectionSpecId">Inspection Spec</Label>
            <Select name="inspectionSpecId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a specification" />
              </SelectTrigger>
              <SelectContent>
                {inspectionSpecs.map((spec) => (
                  <SelectItem key={spec.id} value={spec.id.toString()}>
                    {spec.text.substring(0, 100)}
                    {spec.text.length > 100 ? "..." : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Link href={`/${projectId}/evaluations`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Evaluation"}
            </Button>
          </div>
        </div>
        {state.error && (
          <div className="text-red-500 text-sm">{state.error}</div>
        )}
      </Form>
    </div>
  );
}
