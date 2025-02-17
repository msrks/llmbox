"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { LlmPrompt } from "@/lib/db/schema";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function PromptsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prompts, setPrompts] = useState<LlmPrompt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts");
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPrompts(data.prompts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prompts");
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const promptTemplate = formData.get("promptTemplate") as string;

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promptTemplate }),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Prompt created successfully");
        fetchPrompts();
        setIsDialogOpen(false);
        (event.target as HTMLFormElement).reset();
      }
    } catch {
      toast.error("Failed to create prompt");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Prompts</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Prompt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promptTemplate">Prompt Template</Label>
                  <Textarea
                    id="promptTemplate"
                    name="promptTemplate"
                    placeholder="Enter prompt template"
                    rows={6}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Prompt"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={columns} data={prompts} />
      </div>
    </div>
  );
}
