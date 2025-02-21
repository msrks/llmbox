import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { getPromptTemplates } from "@/lib/db/queries/promptTemplates";
import Link from "next/link";
import { columns } from "./columns";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const promptTemplates = await getPromptTemplates(parseInt(projectId));

  return (
    <div className="mx-auto space-y-8">
      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <PageTitle>Prompt Templates</PageTitle>
          <Link href={`/${projectId}/prompt-templates/new`}>
            <Button>Add Prompt Template</Button>
          </Link>
        </div>
        <DataTable columns={columns} data={promptTemplates} />
      </div>
    </div>
  );
}
