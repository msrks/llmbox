"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LlmPrompt } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";

export const columns: ColumnDef<LlmPrompt>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "promptTemplate",
    header: "Prompt Template",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return formatDate(date);
    },
  },
];
