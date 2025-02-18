import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { db } from "@/lib/db/drizzle";
import { projects } from "@/lib/db/schema";
import { NewProjectDialog } from "./_components/new-project-dialog";
import { desc } from "drizzle-orm";
import { DeleteProjectButton } from "./_components/delete-project-button";

export default async function HomePage() {
  const projectList = await db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)],
  });

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome to LLMBox</h1>
            <p className="text-muted-foreground">
              Select a project to get started
            </p>
          </div>
          <NewProjectDialog />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{project.name}</CardTitle>
                <DeleteProjectButton projectId={project.id} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description}
                </p>
                <Button asChild>
                  <Link href={`/${project.id}`}>Open Project</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
