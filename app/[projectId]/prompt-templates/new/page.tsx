import CreateForm from "./create-form";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <CreateForm projectId={projectId} />;
}
