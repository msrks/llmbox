import { Suspense } from "react";
import { getPrompts } from "./actions";
import { PromptsClient } from "./client";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { prompts } = await getPrompts(projectId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PromptsClient initialPrompts={prompts} projectId={projectId} />
    </Suspense>
  );
}
