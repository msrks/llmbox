"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FileDeleteDialog } from "@/components/file-delete-dialog";
import { FileInfo } from "@/lib/types";
import { Label, Criteria } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { AddCriteriaExampleDialog } from "./add-criteria-example-dialog";

type FileWithLabels = FileInfo & {
  humanLabel?: Label | null;
  aiLabel?: Label | null;
};

interface ColumnOptions {
  previewUrls: Record<number, string>;
  isImageFile: (mimeType: string | null) => boolean;
  onDownload: (fileId: number, originalName: string) => void;
  onDelete: (fileId: number) => Promise<void>;
  criterias: Criteria[];
  criteriaExamples: Record<
    number,
    Array<{
      id: number;
      criteriaId: number;
      isPositive: boolean;
      reason: string | null;
      criteriaName: string;
    }>
  >;
  onAddExample: (data: {
    fileId: number;
    criteriaId: number;
    isPositive: boolean;
    reason: string | null;
  }) => Promise<void>;
}

const getLabelBadgeVariant = (label: Label | null | undefined) => {
  if (!label) return "secondary";
  return label === Label.PASS ? "default" : "destructive";
};

export const getColumns = ({
  previewUrls,
  isImageFile,
  onDownload,
  onDelete,
  criterias,
  criteriaExamples,
  onAddExample,
}: ColumnOptions): ColumnDef<FileWithLabels>[] => [
  {
    accessorKey: "originalName",
    header: "Name",
    enableHiding: false,
  },
  {
    accessorKey: "preview",
    header: "Preview",
    cell: ({ row }) => {
      const file = row.original;
      return (
        <div className="relative w-16 h-16">
          {isImageFile(file.mimeType) ? (
            previewUrls[file.id] ? (
              <Image
                src={previewUrls[file.id]}
                alt={file.originalName}
                fill
                className="object-contain rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "uploadType",
    header: "Upload Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("uploadType")}</span>
    ),
  },
  {
    accessorKey: "lastModified",
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
      return (
        <div>{new Date(row.getValue("lastModified")).toLocaleString()}</div>
      );
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
      const examples = criteriaExamples[file.id] || [];

      return (
        <div className="flex items-center gap-2 flex-wrap">
          {examples.map((example) => (
            <Badge
              key={example.id}
              variant="outline"
              className="flex items-center gap-1"
            >
              {example.isPositive ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              {example.criteriaName}
            </Badge>
          ))}
          <AddCriteriaExampleDialog
            fileId={file.id}
            fileName={file.originalName}
            criterias={criterias}
            onSubmit={onAddExample}
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
            onClick={() => onDownload(file.id, file.originalName)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <FileDeleteDialog
            fileName={file.originalName}
            onDelete={() => onDelete(file.id)}
          />
        </div>
      );
    },
  },
];
