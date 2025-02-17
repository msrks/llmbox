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
    cell: ({ row }) => {
      const template = row.getValue("promptTemplate") as string;
      return <div className="whitespace-pre-wrap">{template}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const dateValue = row.getValue("createdAt");
      // Handle both string and Date objects
      const date =
        dateValue instanceof Date ? dateValue : new Date(dateValue as string);
      return formatDate(date);
    },
  },
];
