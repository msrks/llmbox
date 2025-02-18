"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { TableView } from "./_components/table-view";
import { TileView } from "./_components/tile-view";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDataset } from "./_hooks/use-dataset";

export default function DatasetPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const {
    files,
    criterias,
    filesToCriterias,
    loadingFiles,
    previewUrls,
    isImageFile,
    handleDownload,
    handleDelete,
    handleAddExample,
  } = useDataset(projectId);

  return (
    <div className="container mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Dataset</h2>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loadingFiles ? (
          <div className="text-muted-foreground">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-muted-foreground">No files found</div>
        ) : viewMode === "list" ? (
          <TableView
            files={files}
            previewUrls={previewUrls}
            isImageFile={isImageFile}
            onDownload={handleDownload}
            onDelete={handleDelete}
            criterias={criterias}
            onAddExample={handleAddExample}
            filesToCriterias={filesToCriterias}
          />
        ) : (
          <TileView
            files={files}
            previewUrls={previewUrls}
            isImageFile={isImageFile}
            onDownload={handleDownload}
            onDelete={handleDelete}
            criterias={criterias}
            onAddExample={handleAddExample}
            filesToCriterias={filesToCriterias}
          />
        )}
      </div>
    </div>
  );
}
