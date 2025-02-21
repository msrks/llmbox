"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    </Dialog>
  );
}
