"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LlmPrompt } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deletePrompt } from "../actions";
import { useRouter, useParams } from "next/navigation";
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

const DeletePromptCell = ({ prompt }: { prompt: LlmPrompt }) => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this prompt? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await deletePrompt(prompt.id, projectId);
              router.refresh();
            }}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const columns: ColumnDef<LlmPrompt>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "promptTemplate",
    header: "Prompt Template",
    cell: ({ row }) => {
      const template = row.getValue("promptTemplate") as string;
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
    header: "Created At",
    cell: ({ row }) => {
      const dateValue = row.getValue("createdAt");
      // Handle both string and Date objects
      const date =
        dateValue instanceof Date ? dateValue : new Date(dateValue as string);
      return formatDate(date);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const prompt = row.original;
      return <DeletePromptCell prompt={prompt} />;
    },
  },
];
