"use client";

import { Label } from "@/components/ui/label";
import { createPromptTemplateForm } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRef, useState } from "react";
import { Wand2 } from "lucide-react";
import { PageTitle } from "@/components/page-title";

const PROMPT_TEMPLATE = `You are an AI image classifier tasked with analyzing images according to specific inspection criteria. Your goal is to accurately classify the image based on the given specifications and provide a clear explanation for your classification.

You will be provided with an image input and an inspection specification. The image input will be a text description of the image contents. The inspection specification will detail the criteria you should use to classify the image.

Here is the criterias:
<criterias>
{{CRITERIAS}}
</criterias>

Here is the inspection specification:
<inspection_spec>
{{INSPECTION_SPEC}}
</inspection_spec>

Carefully analyze the image input, paying close attention to the details described. Compare the image contents to the criteria outlined in the inspection specification. Consider all relevant aspects of the image that relate to the specification.

Based on your analysis, determine the appropriate classification for the image. Your classification should be either "Pass" or "Fail" based on whether the image meets all the criteria in the inspection specification.

Provide your response in the following format:
<classification_response>
<explanation>
[Provide a detailed explanation of your reasoning, referencing specific aspects of the image and how they relate to the inspection criteria]
</explanation>
<criteria_results>
[Provide a list of criteria results, each value is either pass or fail]
</criteria_results>
<final_result>
[Provide the final result, either pass or fail]
</final_result>
</classification_response>

Ensure that your explanation is clear, concise, and directly relates to the inspection specification. Your classification should be a direct result of your explained reasoning.`;

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
          size="default"
          className="gap-2"
          onClick={() => setText(PROMPT_TEMPLATE)}
        >
          <Wand2 className="h-4 w-4" />
          Generate Prompt
        </Button>
      </div>
      <form action={createPromptTemplateForm} className="h-[calc(100vh-12rem)]">
        <div className="space-y-4 h-full">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-2 h-[calc(100%-4rem)]">
            <Label htmlFor="text">Text</Label>
            <div className="h-[calc(100%-2rem)]">
              <HighlightedTextarea
                id="text"
                name="text"
                placeholder="Enter prompt template"
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="h-full resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
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
