"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Spec } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

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
  {
    id: "actions",
    cell: ({ row }) => {
      const spec = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                if (spec.onEdit) spec.onEdit(spec);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (spec.onDelete) spec.onDelete(spec);
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
