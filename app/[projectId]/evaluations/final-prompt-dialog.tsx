"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface FinalPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalPrompt: string;
}

export function FinalPromptDialog({
  isOpen,
  onClose,
  finalPrompt,
}: FinalPromptDialogProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt);
    setIsCopied(true);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[99vh]">
        <DialogHeader>
          <DialogTitle className="text-sm">Final Prompt</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto whitespace-pre-wrap text-xs">
          {finalPrompt}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button onClick={handleCopy}>{isCopied ? "Copied" : "Copy"}</Button>
      </DialogFooter>
    </Dialog>
  );
}
