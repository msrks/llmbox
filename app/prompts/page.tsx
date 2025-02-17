"use client";

import { useState, useEffect } from "react";
import type { LlmPrompt } from "@/lib/db/schema";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wand2 } from "lucide-react";
import { IMAGE_CLASSIFIER_TEMPLATE } from "./templates/image-classifier";

interface CreatePromptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPromptCreated: () => void;
}

interface PromptFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  promptTemplate: string;
  onPromptChange: (value: string) => void;
  onGenerateTemplate: () => void;
}

function PromptForm({
  onSubmit,
  isSubmitting,
  promptTemplate,
  onPromptChange,
  onGenerateTemplate,
}: PromptFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 h-full flex flex-col">
      <div className="space-y-2 h-[calc(100%-80px)]">
        <div className="flex justify-between items-center">
          <DialogTitle>Prompt Template</DialogTitle>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerateTemplate}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Prompt
          </Button>
        </div>
        <Textarea
          id="promptTemplate"
          name="promptTemplate"
          placeholder="Enter prompt template"
          rows={20}
          required
          value={promptTemplate}
          onChange={(e) => onPromptChange(e.target.value)}
          className="h-full resize-none"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Prompt"}
        </Button>
      </div>
    </form>
  );
}

export function CreatePromptDialog({
  isOpen,
  onOpenChange,
  onPromptCreated,
}: CreatePromptDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

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
        onPromptCreated();
        onOpenChange(false);
        setPromptTemplate("");
      }
    } catch {
      toast.error("Failed to create prompt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateTemplate = () => {
    setPromptTemplate(IMAGE_CLASSIFIER_TEMPLATE);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] h-[90vh] max-h-[900px]">
        <PromptForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          promptTemplate={promptTemplate}
          onPromptChange={setPromptTemplate}
          onGenerateTemplate={handleGenerateTemplate}
        />
      </DialogContent>
    </Dialog>
  );
}

const PromptsClient = ({
  onPromptCreated,
}: {
  onPromptCreated: () => Promise<void>;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Prompt
      </Button>
      <CreatePromptDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onPromptCreated={onPromptCreated}
      />
    </>
  );
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<LlmPrompt[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container mx-auto py-8 space-y-8">
      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Prompts</h2>
          <PromptsClient onPromptCreated={fetchPrompts} />
        </div>
        <DataTable columns={columns} data={prompts} />
      </div>
    </div>
  );
}
