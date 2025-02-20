"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Criteria } from "@/lib/db/schema";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCriteriaAction } from "./actions";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

function DeleteCriteriaDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deleteCriteriaAction(id);
    toast.success("Criteria deleted successfully");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Delete Criteria</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this criteria?
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleDelete}>Delete</Button>
      </DialogContent>
    </Dialog>
  );
}

function ActionCell({ criteria }: { criteria: Criteria }) {
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
