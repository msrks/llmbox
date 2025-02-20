import { PageTitle } from "@/components/page-title";
import UpsertForm from "../upsert-form";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="mx-auto space-y-8">
      <div className="w-full mx-auto space-y-4">
        <PageTitle>New Criteria</PageTitle>
        <UpsertForm projectId={projectId} />
      </div>
    </div>
  );
}
