"use client";

import { Button } from "@/components/ui/button";
import { deleteCriteriaAction } from "./actions";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function DeleteCriteriaDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deleteCriteriaAction(id);
    toast.success("Criteria deleted successfully");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Trash2 className="h-4 w-4 text-red-500   " />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Criteria</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this criteria?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
