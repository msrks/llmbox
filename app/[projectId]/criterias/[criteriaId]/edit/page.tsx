import { PageTitle } from "@/components/page-title";
import { getCriteria } from "@/lib/db/queries/criterias";
import { notFound } from "next/navigation";
import UpsertForm from "../../upsert-form";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string; criteriaId: string }>;
}) {
  const { projectId, criteriaId } = await params;
  const criteria = await getCriteria(criteriaId);
  if (!criteria) notFound();

  return (
    <div className="mx-auto space-y-8">
      <div className="w-full mx-auto space-y-4">
        <PageTitle>Edit Criteria</PageTitle>
        <UpsertForm projectId={projectId} criteria={criteria} />
      </div>
    </div>
  );
}
