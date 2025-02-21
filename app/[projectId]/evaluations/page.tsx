import { db } from "@/lib/db/drizzle";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { promptEvaluations } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { Plus } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function PromptEvaluationsPage() {
  const evaluations = await db
    .select()
    .from(promptEvaluations)
    .orderBy(desc(promptEvaluations.createdAt));

  return (
    <div className="h-full flex-1 flex-col space-y-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <PageTitle>Prompt Evaluations</PageTitle>
          <p className="text-muted-foreground">
            View and manage your prompt evaluation results
          </p>
        </div>
        <Button asChild>
          <Link href="/evaluations/new">Create New Evaluation</Link>{" "}
          <Plus className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <DataTable data={evaluations} columns={columns} />
    </div>
  );
}
