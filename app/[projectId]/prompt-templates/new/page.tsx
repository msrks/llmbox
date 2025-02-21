import { PageTitle } from "@/components/page-title";
import CreateForm from "./create-form";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="mx-auto space-y-8">
      <div className="w-full mx-auto space-y-4">
        <PageTitle>New Prompt Template</PageTitle>
        <CreateForm projectId={projectId} />
      </div>
    </div>
  );
}
