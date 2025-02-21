import { getInspectionSpecs } from "@/lib/db/queries/inspectionSpecs";
import { getPromptTemplates } from "@/lib/db/queries/promptTemplates";
import CreateForm from "./create-form";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const promptTemplates = await getPromptTemplates(projectId);
  const inspectionSpecs = await getInspectionSpecs(projectId);

  return (
    <CreateForm
      projectId={projectId}
      promptTemplates={promptTemplates}
      inspectionSpecs={inspectionSpecs}
    />
  );
}
