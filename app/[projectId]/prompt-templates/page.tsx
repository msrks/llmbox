import { Suspense } from "react";
import { getPrompts } from "./actions";
import { PromptsClient } from "./client";

interface PromptsPageProps {
  params: {
    projectId: string;
  };
}

export default async function PromptsPage({ params }: PromptsPageProps) {
  const { prompts } = await getPrompts(params.projectId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PromptsClient initialPrompts={prompts} projectId={params.projectId} />
    </Suspense>
  );
}
