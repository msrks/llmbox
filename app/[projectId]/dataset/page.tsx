import { redirect } from "next/navigation";

export default function DatasetPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/${params.projectId}/table-view`);
}
