"use client";

import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, XCircle } from "lucide-react";
import { FileDeleteDialog } from "@/components/file-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { FilePreview } from "@/components/file-preview";
import { deleteFileAction, upsertFileToCriteriaAction } from "../actions";
import { getPresignedUrlByFileNameAction } from "@/app/actions";
import { AddCriteriaExampleDialog } from "@/app/[projectId]/(dataset)/add-criteria-example-dialog";
import { toast } from "sonner";
import { getLabelBadgeVariant } from "@/lib/utils";
import { FileWithCriterias } from "@/lib/db/queries/files";

export function DataTile({ data }: { data: FileWithCriterias[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((file) => (
        <div
          key={file.id}
          className="relative group border rounded-lg p-4 space-y-2"
        >
          <div className="relative aspect-square">
            <FilePreview
              fileName={file.fileName}
              mimeType={file.mimeType}
              className="w-full h-full"
            />
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
              onClick={async () => {
                const url = await getPresignedUrlByFileNameAction(
                  file.fileName
                );
                window.open(url, "_blank");
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <AddCriteriaExampleDialog
              fileId={file.id}
              fileName={file.fileName}
              onSubmit={async (data) => {
                try {
                  await upsertFileToCriteriaAction(data);
                  toast.success("Added criteria example");
                } catch {
                  toast.error("Failed to add criteria example");
                }
              }}
            />
            <FileDeleteDialog
              fileName={file.fileName}
              onDelete={async () => {
                try {
                  await deleteFileAction(file.id, file.fileName);
                  toast.success("File deleted successfully");
                } catch {
                  toast.error("Failed to delete file");
                }
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
