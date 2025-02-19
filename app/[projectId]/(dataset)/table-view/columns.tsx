"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ArrowUpDown, Download, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDeleteDialog } from "@/components/file-delete-dialog";
import { Label } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  deleteFile,
  upsertFileToCriteria,
  FilesWithCriterias,
} from "../actions";
import { FilePreview } from "../../../../components/file-preview";
import { AddCriteriaExampleDialog } from "../_components/add-criteria-example-dialog";
import { getPresignedUrlByFileNameAction } from "@/app/actions";

type FileWithLabels = FilesWithCriterias[number];

const getLabelBadgeVariant = (label: Label | null | undefined) => {
  if (!label) return "secondary";
  return label === Label.PASS ? "default" : "destructive";
};

export const columns: ColumnDef<FileWithLabels>[] = [
  {
    accessorKey: "originalName",
    header: "Name",
  },
  {
    accessorKey: "preview",
    cell: ({ row }) => {
      const file = row.original;
      return (
        <div className="relative w-16 h-16">
          <FilePreview
            fileName={file.fileName}
            mimeType={file.mimeType}
            className="w-full h-full"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "uploadType",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("uploadType")}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Upload Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "humanLabel",
    header: "Human Label",
    cell: ({ row }) => {
      const label = row.original.humanLabel;
      return (
        <Badge variant={getLabelBadgeVariant(label)}>
          {label?.toUpperCase() || "UNLABELED"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "aiLabel",
    header: "AI Label",
    cell: ({ row }) => {
      const label = row.original.aiLabel;
      return (
        <Badge variant={getLabelBadgeVariant(label)}>
          {label?.toUpperCase() || "UNLABELED"}
        </Badge>
      );
    },
  },
  {
    id: "criterias",
    header: "Criterias",
    cell: ({ row }) => {
      const file = row.original;
      return (
        <div key={file.id} className="flex items-center gap-2 flex-wrap">
          {file.filesToCriterias.map((example) => (
            <Badge
              key={`${example.fileId}-${example.criteriaId}`}
              variant="outline"
              className="flex items-center gap-1"
            >
              {!example.isFail ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              {example.criteria.name}
            </Badge>
          ))}
          <AddCriteriaExampleDialog
            fileId={file.id}
            fileName={file.fileName}
            onSubmit={async (data) => {
              try {
                await upsertFileToCriteria(data);
                toast.success("Added criteria example");
              } catch {
                toast.error("Failed to add criteria example");
              }
            }}
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const file = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              const url = await getPresignedUrlByFileNameAction(file.fileName);
              window.open(url, "_blank");
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
          <FileDeleteDialog
            fileName={file.fileName}
            onDelete={async () => {
              try {
                const result = await deleteFile(file.id);
                if ("error" in result) {
                  toast.error(result.error);
                  return;
                }
                toast.success("File deleted successfully");
              } catch {
                toast.error("Failed to delete file");
              }
            }}
          />
        </div>
      );
    },
  },
];
