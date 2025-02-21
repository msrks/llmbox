import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { getPromptEvaluations } from "@/lib/db/queries/promptEvaluations";
import Link from "next/link";
import { columns } from "./columns";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const evaluations = await getPromptEvaluations(parseInt(projectId));

  return (
    <div className="mx-auto space-y-8">
      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <PageTitle>Prompt Evaluations</PageTitle>
          <Link href={`/${projectId}/evaluations/new`}>
            <Button>Add Prompt Evaluation</Button>
          </Link>
        </div>
        <DataTable columns={columns} data={evaluations} />
      </div>
    </div>
  );
}
