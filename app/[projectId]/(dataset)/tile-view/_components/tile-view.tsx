"use client";

import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, XCircle } from "lucide-react";
import { FileDeleteDialog } from "@/components/file-delete-dialog";
import { Label } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { AddCriteriaExampleDialog } from "../../dataset/_components/add-criteria-example-dialog";
import { Dataset } from "../../hooks";
import { getPresignedUrl } from "../../actions";
import { FilePreview } from "../../dataset/_components/file-preview";

const getLabelBadgeVariant = (label: Label | null | undefined) => {
  if (!label) return "secondary";
  return label === Label.PASS ? "default" : "destructive";
};

export function TileView({
  filesWithCriterias,
  criterias,
  upsertFile2Criteria,
  handleDelete,
}: Dataset) {
  const handleDownload = async (fileId: number) => {
    const url = await getPresignedUrl(fileId);
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filesWithCriterias.map((file) => (
        <div
          key={file.id}
          className="relative group border rounded-lg p-4 space-y-2"
        >
          <div className="relative aspect-square">
            <FilePreview
              fileId={file.id}
              fileName={file.originalName}
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
              onClick={() => handleDownload(file.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <AddCriteriaExampleDialog
              fileId={file.id}
              fileName={file.originalName}
              criterias={criterias}
              onSubmit={upsertFile2Criteria}
            />
            <FileDeleteDialog
              fileName={file.originalName}
              onDelete={() => handleDelete(file.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
