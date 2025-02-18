import { db } from "@/lib/db/drizzle";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { promptEvaluations } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
          <h2 className="text-2xl font-bold tracking-tight">
            Prompt Evaluations
          </h2>
          <p className="text-muted-foreground">
            View and manage your prompt evaluation results
          </p>
        </div>
        <Button asChild>
          <Link href="/evaluation-results/new">Create New Evaluation</Link>
        </Button>
      </div>
      <DataTable data={evaluations} columns={columns} />
    </div>
  );
}
