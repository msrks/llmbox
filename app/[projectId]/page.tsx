import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon, MessagesSquare, ClipboardCheck } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { PageTitle } from "@/components/page-title";
import { getProjectWithStats } from "@/lib/db/queries/projects";
export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProjectWithStats(parseInt(projectId));
  if (!project) {
    notFound();
  }

  return (
    <div className=" mx-auto">
      <div className="mb-8">
        <PageTitle>{project.name}</PageTitle>
        <p className="text-muted-foreground">
          <span>{project.description}</span>
          <span>Created {formatDistanceToNow(project.createdAt)} ago</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files</CardTitle>
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.stats.files}</div>
            <p className="text-xs text-muted-foreground">
              Total uploaded files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prompts</CardTitle>
            <MessagesSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.stats.prompts}</div>
            <p className="text-xs text-muted-foreground">LLM prompts created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluations</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.stats.evaluations}
            </div>
            <p className="text-xs text-muted-foreground">
              Prompt evaluations run
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
