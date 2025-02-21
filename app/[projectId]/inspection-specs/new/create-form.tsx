"use client";

import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { createInspectionSpecForm } from "../actions";

const TEMPLATE = `Metal Nut Quality Inspection Criteria
1. Size: The outer diameter, inner diameter, and thickness must conform to the specified tolerance limits as per design drawings.
2. Surface Defects:
2.1. Scratches: No visible scratches exceeding 0.5 mm in width or 5 mm in length. Any deep scratches that compromise structural integrity are unacceptable.
2.2. Dents: No dents larger than 0.3 mm in depth or affecting functional surfaces.
2.3. Burrs: No sharp or excessive burrs that could impact assembly or pose safety risks.
2.4. Corrosion: No visible signs of rust, oxidation, or discoloration on the surface.
3. Shape and Symmetry: The nut must maintain its designed geometry, with no deformation or warping that affects functionality.
4. Thread Quality: The internal threading must be free from defects such as cross-threading, damage, or incomplete formation. The nut must properly engage with a standard gauge without excessive resistance.
5. Cleanliness: The nut must be free from oil, grease, dirt, or any other contaminants that could impact performance.
6. Machining Marks: Minor tool marks are acceptable as long as they do not affect the integrity or usability of the nut.
7. Edge Quality: All edges should be smooth and well-finished, with no sharp protrusions that could cause injury or hinder assembly.
8. Overall Acceptability: If a nut fails to meet any of the above criteria, it must be classified as defective and removed from the acceptable lot.`;

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
  const [text, setText] = useState("");
  const [state, formAction, isPending] = useActionState(
    createInspectionSpecForm,
    {
      error: "",
      text: TEMPLATE,
    }
  );

  return (
    <div className="w-full mx-auto space-y-4">
      <div className="flex flex-row items-center justify-between">
        <PageTitle>New Inspection Spec</PageTitle>
        <Button
          type="button"
          variant="outline"
          size="default"
          className="gap-2"
          onClick={() => setText(TEMPLATE)}
        >
          <Wand2 className="h-4 w-4" />
          Generate Spec
        </Button>
      </div>
      <Form action={formAction} className="h-[calc(100vh-12rem)]">
        <div className="space-y-4 h-full">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-2 h-[calc(100%-4rem)]">
            <Label htmlFor="text">Inspection Criteria</Label>
            <div className="h-[calc(100%-2rem)]">
              <HighlightedTextarea
                id="text"
                name="text"
                placeholder="Enter inspection criteria"
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="h-full resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Link href={`/${projectId}/inspection-specs`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Inspection Spec"}
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
