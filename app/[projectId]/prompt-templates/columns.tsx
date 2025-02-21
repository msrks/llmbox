"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PromptTemplate } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";
import { DeletePromptTemplateDialog } from "./delete-dialog";
export const columns: ColumnDef<PromptTemplate>[] = [
  { accessorKey: "id" },
  {
    accessorKey: "text",
    cell: ({ row }) => {
      const template = row.getValue("text") as string;
      // Split the template by {{...}} patterns and create an array of regular text and highlighted spans
      const parts = template.split(/(\{\{.*?\}\})/);
      return (
        <div className="whitespace-pre-wrap text-xs">
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
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const promptTemplate = row.original;
      return (
        <div className="flex gap-1">
          <DeletePromptTemplateDialog id={promptTemplate.id.toString()} />
        </div>
      );
    },
  },
];
