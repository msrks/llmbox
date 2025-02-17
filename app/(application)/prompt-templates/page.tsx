import { Suspense } from "react";
import { getPrompts } from "./actions";
import { PromptsClient } from "./client";

export default async function PromptsPage() {
  const { prompts } = await getPrompts();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PromptsClient initialPrompts={prompts} />
    </Suspense>
  );
}
