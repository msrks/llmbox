"use client";

import {
  Upload,
  MessageSquare,
  Tag,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Book,
  ChartBar,
  Home,
  Rocket,
  List,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../../components/theme-toggle";
import { Button } from "../../components/ui/button";
import { useParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Project } from "@/lib/db/schema";
// Menu items.
const getMenuGroups = (projectId: string) => [
  {
    label: "Dataset",
    items: [
      {
        title: "Table View",
        url: `/${projectId}/table-view`,
        icon: List,
      },
      {
        title: "Tile View",
        url: `/${projectId}/tile-view`,
        icon: LayoutGrid,
      },
      {
        title: "Criterias",
        url: `/${projectId}/criterias`,
        icon: Tag,
      },
      {
        title: "Manual Upload",
        url: `/${projectId}/upload`,
        icon: Upload,
      },
    ],
  },
  {
    label: "Prompt Optimization",
    items: [
      {
        title: "Prompt Templates",
        url: `/${projectId}/prompt-templates`,
        icon: Sparkles,
      },
      {
        title: "Inspection Specs",
        url: `/${projectId}/inspection-specs`,
        icon: Book,
      },
      {
        title: "Evaluations",
        url: `/${projectId}/evaluations`,
        icon: ChartBar,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        title: "Chat",
        url: `/${projectId}/chat`,
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Navigation",
    items: [
      {
        title: "Project List",
        url: "/projects",
        icon: List,
      },
      {
        title: "Project Root",
        url: `/${projectId}`,
        icon: Home,
      },
      {
        title: "Landing Page",
        url: "/",
        icon: Rocket,
      },
    ],
  },
];

export function AppSidebar({ projects }: { projects: Project[] }) {
  const { projectId } = useParams();
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const currentProjectId = typeof projectId === "string" ? projectId : "";
  const menuGroups = getMenuGroups(currentProjectId);
  const router = useRouter();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </Button>
        {/* Project Selector is hidden on collapsed mode */}
        {!isCollapsed && (
          <Select
            value={currentProjectId}
            onValueChange={(value) => {
              router.push(`/${value}`);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!isCollapsed && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon size={18} />
                        {!isCollapsed && (
                          <span className="text-sm">{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-2">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
