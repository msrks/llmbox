"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PromptEvaluation } from "@/lib/db/schema";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

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
  },
  {
    accessorKey: "specId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Spec ID" />
    ),
  },
];
