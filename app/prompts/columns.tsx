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
      // Split the template by {{...}} patterns and create an array of regular text and highlighted spans
      const parts = template.split(/(\{\{.*?\}\})/);
      return (
        <div className="whitespace-pre-wrap">
          {parts.map((part, index) => {
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
      );
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
