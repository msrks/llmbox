"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Criteria } from "@/lib/db/schema";
import { DeleteCriteriaDialog } from "./delete-criteria-dialog";
import { EditCriteriaDialog } from "./edit-criteria-dialog";

function ActionCell({ criteria }: { criteria: Criteria }) {
  return (
    <div className="flex gap-2">
      <EditCriteriaDialog criteria={criteria} />
      <DeleteCriteriaDialog id={criteria.id.toString()} />
    </div>
  );
}

export const columns: ColumnDef<Criteria>[] = [
  { accessorKey: "name" },
  { accessorKey: "description" },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell criteria={row.original} />,
  },
];
