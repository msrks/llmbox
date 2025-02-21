import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { getInspectionSpecs } from "@/lib/db/queries/inspectionSpecs";
import Link from "next/link";
import { columns } from "./columns";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const inspectionSpecs = await getInspectionSpecs(projectId);

  return (
    <div className="mx-auto space-y-8">
      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <PageTitle>Inspection Specs</PageTitle>
          <Link href={`/${projectId}/inspection-specs/new`}>
            <Button>Add Inspection Spec</Button>
          </Link>
        </div>
        <DataTable columns={columns} data={inspectionSpecs} />
      </div>
    </div>
  );
}
