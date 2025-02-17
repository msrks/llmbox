"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Label } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label as UILabel } from "@/components/ui/label";
import { useState } from "react";
import { updateLabel, deleteLabel } from "./actions";
import { toast } from "sonner";

interface LabelActionsProps {
  label: Label;
}

function LabelActions({ label }: LabelActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const definition = formData.get("definition") as string;

    try {
      const result = await updateLabel(label.id, { title, definition });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Label updated successfully");
        setIsEditing(false);
        // Trigger a refresh of the labels list
        window.location.reload();
      }
    } catch {
      toast.error("Failed to update label");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteLabel(label.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Label deleted successfully");
        // Trigger a refresh of the labels list
        window.location.reload();
      }
    } catch {
      toast.error("Failed to delete label");
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <UILabel htmlFor="title">Title</UILabel>
              <Input
                id="title"
                name="title"
                defaultValue={label.title}
                required
              />
            </div>
            <div className="space-y-2">
              <UILabel htmlFor="definition">Definition</UILabel>
              <Textarea
                id="definition"
                name="definition"
                defaultValue={label.definition || ""}
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Label"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              label.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <LabelActions label={row.original} />,
  },
];
