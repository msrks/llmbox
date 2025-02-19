"use client";

import { PageTitle } from "@/components/page-title";
import { useParams } from "next/navigation";
import { useDataset } from "../hooks";
import { TileView } from "./_components/tile-view";

export default function TileViewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const dataset = useDataset(projectId);

  return (
    <div className="container mx-auto space-y-8">
      <div className="space-y-4">
        <PageTitle>Dataset - Tile View</PageTitle>
        {dataset.loadingFiles ? (
          <div className="text-muted-foreground">Loading files...</div>
        ) : dataset.filesWithCriterias.length === 0 ? (
          <div className="text-muted-foreground">No files found</div>
        ) : (
          <TileView {...dataset} />
        )}
      </div>
    </div>
  );
}
