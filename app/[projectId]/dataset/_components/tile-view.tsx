"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, XCircle } from "lucide-react";
import { FileDeleteDialog } from "@/components/file-delete-dialog";
import { Label } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { AddCriteriaExampleDialog } from "./add-criteria-example-dialog";
import { Dataset } from "../hooks";
import { getPresignedUrl } from "../actions";
const getLabelBadgeVariant = (label: Label | null | undefined) => {
  if (!label) return "secondary";
  return label === Label.PASS ? "default" : "destructive";
};

export function TileView(dataset: Dataset) {
  const handleDownload = async (fileId: number) => {
    const url = await getPresignedUrl(fileId);
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {dataset.filesWithCriterias.map((file) => (
        <div
          key={file.id}
          className="relative group border rounded-lg p-4 space-y-2"
        >
          <div className="relative aspect-square">
            {dataset.isImageFile(file.mimeType) ? (
              // dataset.previewUrls[file.id] ? (
              //   <Image
              //     src={dataset.previewUrls[file.id]}
              //     alt={file.originalName}
              //     fill
              //     className="object-contain rounded-md"
              //   />
              // ) : (
              //   <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
              //     <span className="text-sm text-muted-foreground">
              //       Loading...
              //     </span>
              //   </div>
              // )
              <Image
                src={file.fileName}
                alt={file.originalName}
                fill
                className="object-contain rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                <svg
                  className="w-12 h-12 text-muted-foreground"
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

          <div className="space-y-1">
            <p
              className="text-sm font-medium truncate"
              title={file.originalName}
            >
              {file.originalName}
            </p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <div className="flex gap-2">
              <Badge variant={getLabelBadgeVariant(file.humanLabel)}>
                {file.humanLabel?.toUpperCase() || "UNLABELED"}
              </Badge>
              <Badge variant={getLabelBadgeVariant(file.aiLabel)}>
                {file.aiLabel?.toUpperCase() || "UNLABELED"}
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              {file.filesToCriterias.map((example) => (
                <Badge
                  key={example.criteria.id}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {example.criteria.name}
                  {example.isFail ? (
                    <XCircle className="h-3 w-3 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(file.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <AddCriteriaExampleDialog
              fileId={file.id}
              fileName={file.originalName}
              criterias={dataset.criterias}
              onSubmit={dataset.upsertFile2Criteria}
            />
            <FileDeleteDialog
              fileName={file.originalName}
              onDelete={() => dataset.handleDelete(file.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
