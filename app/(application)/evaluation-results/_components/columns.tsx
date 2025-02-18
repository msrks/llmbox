"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PromptEvaluation } from "@/lib/db/schema";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FinalPromptDialog } from "./final-prompt-dialog";
import { Eye } from "lucide-react";

export const columns: ColumnDef<PromptEvaluation>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score" />
    ),
    cell: ({ row }) => {
      const score = row.getValue("score") as number;
      return <div className="font-medium">{score?.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div>
          {new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(new Date(date))}
        </div>
      );
    },
  },
  {
    accessorKey: "promptId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prompt ID" />
    ),
    cell: ({ row }) => {
      const promptId = row.getValue("promptId") as string;
      return (
        <Link
          href={`/prompt-templates?id=${promptId}`}
          className="text-primary hover:underline"
        >
          {promptId}
        </Link>
      );
    },
  },
  {
    accessorKey: "finalPrompt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Final Prompt" />
    ),
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
            <div className="max-w-[400px] truncate">{finalPrompt}</div>
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
    accessorKey: "specId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Spec ID" />
    ),
    cell: ({ row }) => {
      const specId = row.getValue("specId") as string;
      return (
        <Link
          href={`/inspection-specs?id=${specId}`}
          className="text-primary hover:underline"
        >
          {specId}
        </Link>
      );
    },
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
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
];
