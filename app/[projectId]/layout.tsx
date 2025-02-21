import { AppSidebar } from "@/app/[projectId]/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getProjects } from "@/lib/db/queries/projects";

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await getProjects();
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <AppSidebar projects={projects} />
        <main className="flex-1 p-4 w-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
