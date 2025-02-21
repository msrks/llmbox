"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromptEvaluation } from "@/lib/db/schema";
import { formatDate, formatDuration } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteEvaluationResultDialog } from "./delete-dialog";
import { FinalPromptDialog } from "./final-prompt-dialog";

export const columns: ColumnDef<PromptEvaluation>[] = [
  {
    accessorKey: "id",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return (
        <Link
          href={`/evaluations/${id}`}
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
      const score = row.getValue("score") as number | null;
      return <div className="font-medium">{score?.toFixed(1)}%</div>;
    },
  },
  {
    accessorKey: "numDataset",
    cell: ({ row }) => {
      const numDataset = row.getValue("numDataset") as number | null;
      return <div>{numDataset}</div>;
    },
  },
  {
    accessorKey: "duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number | null;
      return <div>{duration ? formatDuration(duration) : "-"}</div>;
    },
  },
  {
    accessorKey: "finalPrompt",
    cell: function Cell({ row }) {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const finalPrompt = row.getValue("finalPrompt") as string;

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
    accessorKey: "state",
    cell: ({ row }) => {
      const state = row.getValue("state") as "running" | "failed" | "finished";
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
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
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
