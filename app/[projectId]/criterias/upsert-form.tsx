"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Criteria } from "@/lib/db/schema";
import Form from "next/form";
import Link from "next/link";
import { useActionState } from "react";
import { upsertCriteriaForm } from "./actions";

export default function UpsertForm({
  projectId,
  criteria,
}: {
  projectId: string;
  criteria?: Criteria;
}) {
  const [state, formAction, isPending] = useActionState(upsertCriteriaForm, {
    error: "",
    name: "",
    description: "",
  });

  return (
    <Form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="id" value={criteria?.id} />
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={state.name ?? criteria?.name ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={state.description ?? criteria?.description ?? ""}
            className="resize-none min-h-[120px]"
            rows={4}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Link href={`/${projectId}/criterias`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {criteria ? "Update Criteria" : "Create Criteria"}
        </Button>
      </div>
      {state.error && <div className="text-red-500 text-sm">{state.error}</div>}
    </Form>
  );
}
