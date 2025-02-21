import { PageTitle } from "@/components/page-title";
import { getFilesWithCriterias } from "@/lib/db/queries/files";
import { columns } from "./columns";
import { DataTable } from "../../../../components/data-table";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const filesWithCriterias = await getFilesWithCriterias(parseInt(projectId));

  return (
    <div className="container mx-auto space-y-8">
      <div className="space-y-4">
        <PageTitle>Dataset - Table View</PageTitle>
        <DataTable columns={columns} data={filesWithCriterias} />
      </div>
    </div>
  );
}
