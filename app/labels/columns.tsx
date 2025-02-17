"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Label } from "@/lib/db/schema";

export const columns: ColumnDef<Label>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "definition",
    header: "Definition",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleString();
    },
  },
];
