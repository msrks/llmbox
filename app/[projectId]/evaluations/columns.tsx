"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromptEvaluation } from "@/lib/db/schema";
import { formatDate, formatDuration } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnalysisDialog } from "./analysis-dialog";
import { DeleteEvaluationResultDialog } from "./delete-dialog";
import { FinalPromptDialog } from "./final-prompt-dialog";

export const columns: ColumnDef<PromptEvaluation>[] = [
  {
    accessorKey: "id",
    cell: ({ row }) => {
      const id = row.original.id;
      const projectId = row.original.projectId;
      return (
        <Link
          href={`/${projectId}/evaluations/${id}`}
          className="text-primary hover:underline"
        >
          {id}
        </Link>
      );
    },
  },
  {
    accessorKey: "score",
    cell: ({ row }) => {
      const score = row.original.score;
      return <div className="font-medium">{score?.toFixed(2)}</div>;
    },
  },
  { accessorKey: "numDataset" },
  {
    accessorKey: "duration",
    cell: ({ row }) => {
      const duration = row.original.duration;
      return <div>{duration ? formatDuration(duration) : "-"}</div>;
    },
  },
  {
    accessorKey: "finalPrompt",
    cell: function Cell({ row }) {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const finalPrompt = row.original.finalPrompt;

      return (
        <>
          <Button
            variant="ghost"
            className="h-auto p-0 text-left font-normal hover:bg-transparent group flex items-center gap-1"
            onClick={() => setIsDialogOpen(true)}
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
              <Eye className="h-3 w-3" />
              Click to view
            </span>
          </Button>
          <FinalPromptDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            finalPrompt={finalPrompt}
          />
        </>
      );
    },
  },
  {
    accessorKey: "analysisText",
    header: "Analysis",
    cell: function Cell({ row }) {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const analysisText = row.original.analysisText;

      if (!analysisText)
        return <div className="text-muted-foreground text-xs">No analysis</div>;

      return (
        <>
          <Button
            variant="ghost"
            className="h-auto p-0 text-left font-normal hover:bg-transparent group flex items-center gap-1"
            onClick={() => setIsDialogOpen(true)}
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
              <Eye className="h-3 w-3" />
              View analysis
            </span>
          </Button>
          <AnalysisDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            analysisText={analysisText}
          />
        </>
      );
    },
  },
  {
    accessorKey: "state",
    cell: ({ row }) => {
      const state = row.original.state;
      const variants = {
        running: "secondary",
        failed: "destructive",
        finished: "default",
      } as const;
      return (
        <Badge variant={variants[state]}>
          {state.charAt(0).toUpperCase() + state.slice(1)}
        </Badge>
      );
    },
  },
  { accessorKey: "promptTemplateId" },
  { accessorKey: "inspectionSpecId" },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const promptTemplate = row.original;
      return (
        <div className="flex gap-1">
          <DeleteEvaluationResultDialog id={promptTemplate.id.toString()} />
        </div>
      );
    },
  },
];
