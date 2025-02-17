"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Spec } from "@/lib/db/schema";

export const columns: ColumnDef<Spec>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const template = row.getValue("description") as string;
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
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    },
  },
];
