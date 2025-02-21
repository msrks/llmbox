"use client";

import { Button } from "@/components/ui/button";
import { Criteria } from "@/lib/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { DeleteCriteriaDialog } from "./delete-dialog";

export const columns: ColumnDef<Criteria>[] = [
  { accessorKey: "name" },
  { accessorKey: "description" },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const criteria = row.original;
      return (
        <div className="flex gap-1">
          <Link href={`/${criteria.projectId}/criterias/${criteria.id}/edit`}>
            <Button size="sm" variant="ghost">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteCriteriaDialog id={criteria.id.toString()} />
        </div>
      );
    },
  },
];
