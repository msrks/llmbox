import { PageTitle } from "@/components/page-title";
import { DataTile } from "./data-tile";
import { getFilesWithCriterias } from "@/lib/db/queries/files";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const filesWithCriterias = await getFilesWithCriterias(projectId);

  return (
    <div className="container mx-auto space-y-8">
      <div className="space-y-4">
        <PageTitle>Dataset - Tile View</PageTitle>
        <DataTile data={filesWithCriterias} />
      </div>
    </div>
  );
}
