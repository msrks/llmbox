import { notFound } from "next/navigation";
import {
  FileIcon,
  MessagesSquare,
  ClipboardCheck,
  Tag,
  File,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { PageTitle } from "@/components/page-title";
import { getProjectWithStats } from "@/lib/db/queries/projects";
import { StatsCard } from "./stats-card";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProjectWithStats(parseInt(projectId));
  if (!project) notFound();

  const stats = [
    { title: "Files", value: project.stats.files, Icon: FileIcon },
    { title: "Prompts", value: project.stats.prompts, Icon: MessagesSquare },
    {
      title: "Evaluations",
      value: project.stats.evaluations,
      Icon: ClipboardCheck,
    },
    {
      title: "Criterias",
      value: project.stats.criterias,
      Icon: Tag,
    },
    {
      title: "Inspection Specs",
      value: project.stats.inspectionSpecs,
      Icon: File,
    },
  ];

  return (
    <div className="mx-auto">
      <div className="mb-8 space-y-2">
        <PageTitle>{project.name}</PageTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <p>{project.description}</p>
          <span>•</span>
          <p>Created {formatDistanceToNow(project.createdAt)} ago</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            Icon={stat.Icon}
          />
        ))}
      </div>
    </div>
  );
}
