import { AppSidebar } from "@/app/[projectId]/_components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-4 w-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
