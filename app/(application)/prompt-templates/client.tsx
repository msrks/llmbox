"use client";

import { useState } from "react";
import type { LlmPrompt } from "@/lib/db/schema";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wand2 } from "lucide-react";
import { IMAGE_CLASSIFIER_TEMPLATE } from "./templates/image-classifier";
import { getPrompts, createPrompt } from "./actions";
import React from "react";

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

function HighlightedTextarea({
  value,
  onChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof Textarea>) {
  const parts = value.split(/(\{\{.*?\}\})/);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Sync scroll between textarea and overlay
  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative h-full">
      <Textarea
        {...props}
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        className="h-full resize-none font-mono absolute inset-0 bg-transparent text-transparent caret-black selection:bg-blue-400/20 z-10"
      />
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none whitespace-pre-wrap font-mono p-[13px] overflow-hidden text-xs"
      >
        {parts.map((part, index) => {
          if (part.match(/^\{\{.*\}\}$/)) {
            return (
              <span key={index} className="text-orange-500">
                {part}
              </span>
            );
          }
          return part;
        })}
      </div>
    </div>
  );
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
        <HighlightedTextarea
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

function CreatePromptDialog({
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
      await createPrompt(promptTemplate);
      toast.success("Prompt created successfully");
      onPromptCreated();
      onOpenChange(false);
      setPromptTemplate("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create prompt"
      );
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

export function PromptsClient({
  initialPrompts,
}: {
  initialPrompts: LlmPrompt[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [prompts, setPrompts] = useState<LlmPrompt[]>(initialPrompts);

  const refreshPrompts = async () => {
    try {
      const { prompts: newPrompts } = await getPrompts();
      setPrompts(newPrompts);
    } catch {
      toast.error("Failed to refresh prompts");
    }
  };

  return (
    <div className="mx-auto space-y-8">
      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Prompt Templates
          </h2>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Prompt
          </Button>
        </div>
        <DataTable columns={columns} data={prompts} />
      </div>
      <CreatePromptDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onPromptCreated={refreshPrompts}
      />
    </div>
  );
}
