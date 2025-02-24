"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  analysisText: string | null;
}

export function AnalysisDialog({
  isOpen,
  onClose,
  analysisText,
}: AnalysisDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Analysis</DialogTitle>
        </DialogHeader>
        <div className="mt-4 whitespace-pre-wrap text-sm">
          {analysisText || "No analysis available"}
        </div>
      </DialogContent>
    </Dialog>
  );
}
