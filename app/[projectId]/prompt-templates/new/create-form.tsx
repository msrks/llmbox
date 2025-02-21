"use client";

import { Label } from "@/components/ui/label";
import { createPromptTemplateForm } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRef, useState } from "react";
import { Wand2 } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { PROMPT_TEMPLATE } from "./template";

function HighlightedTextarea({
  value,
  onChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof Textarea>) {
  const textValue = String(value || "");
  const parts = textValue.split(/(\{\{.*?\}\})/);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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
        {parts.map((part: string, index: number) => {
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

export default function CreateForm({ projectId }: { projectId: string }) {
  const [text, setText] = useState(PROMPT_TEMPLATE);

  return (
    <div className="w-full mx-auto space-y-4">
      <div className="flex flex-row items-center justify-between">
        <PageTitle>New Prompt Template</PageTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setText(PROMPT_TEMPLATE)}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Generate Prompt
        </Button>
      </div>
      <form action={createPromptTemplateForm}>
        <div className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <HighlightedTextarea
              id="text"
              name="text"
              placeholder="Enter prompt template"
              rows={20}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-full resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Link href={`/${projectId}/prompt-templates`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit">Create Prompt Template</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
