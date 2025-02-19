"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { TableView } from "./_components/table-view";
import { TileView } from "./_components/tile-view";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDataset } from "./hooks";
import { PageTitle } from "@/components/page-title";
export default function DatasetPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const dataset = useDataset(projectId);

  return (
    <div className="container mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <PageTitle>Dataset</PageTitle>
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

        {dataset.loadingFiles ? (
          <div className="text-muted-foreground">Loading files...</div>
        ) : dataset.filesWithCriterias.length === 0 ? (
          <div className="text-muted-foreground">No files found</div>
        ) : viewMode === "list" ? (
          <TableView dataset={dataset} />
        ) : (
          <TileView dataset={dataset} />
        )}
      </div>
    </div>
  );
}
