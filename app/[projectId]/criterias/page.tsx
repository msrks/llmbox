import { columns } from "./columns";
import { PageTitle } from "@/components/page-title";
import { DataTable } from "@/components/data-table";
import { getCriterias } from "@/lib/db/queries/criterias";
import { AddCriteriaDialog } from "./add-criteria-dialog";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const criterias = await getCriterias(projectId);

  return (
    <div className="mx-auto space-y-8">
      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <PageTitle>Criterias</PageTitle>
          <AddCriteriaDialog />
        </div>
        <DataTable columns={columns} data={criterias} />
      </div>
    </div>
  );
}
