"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Criteria } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  deleteCriteria,
  updateCriteria,
  createCriteriaExample,
} from "../actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

function ActionCell({ criteria }: { criteria: Criteria }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExampleDialogOpen, setIsExampleDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      const result = await updateCriteria(criteria.id, {
        name,
        description,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Criteria updated successfully");
        setIsDialogOpen(false);
        window.location.reload();
      }
    } catch {
      toast.error("Failed to update criteria");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddExample(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const fileId = parseInt(formData.get("fileId") as string);
    const isPositive = formData.get("type") === "positive";
    const reason = formData.get("reason") as string;

    try {
      const result = await createCriteriaExample({
        fileId,
        criteriaId: criteria.id,
        isPositive,
        reason,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Example added successfully");
        setIsExampleDialogOpen(false);
        (event.target as HTMLFormElement).reset();
      }
    } catch {
      toast.error("Failed to add example");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      const result = await deleteCriteria(criteria.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Criteria deleted successfully");
        window.location.reload();
      }
    } catch {
      toast.error("Failed to delete criteria");
    }
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DialogTrigger asChild>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem onClick={() => setIsExampleDialogOpen(true)}>
              Add Example
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Criteria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={criteria.name}
                  placeholder="Enter criteria name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={criteria.description || ""}
                  placeholder="Enter criteria description"
                  className="resize-none min-h-[120px]"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Criteria"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isExampleDialogOpen} onOpenChange={setIsExampleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Example for {criteria.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExample} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileId">File ID</Label>
                <Input
                  id="fileId"
                  name="fileId"
                  type="number"
                  placeholder="Enter file ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <RadioGroup name="type" defaultValue="positive" required>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive" id="positive" />
                    <Label htmlFor="positive">Positive Example</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negative" id="negative" />
                    <Label htmlFor="negative">Negative Example</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Enter reason why this is a good/bad example"
                  className="resize-none min-h-[120px]"
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Example"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<Criteria>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell criteria={row.original} />,
  },
];
