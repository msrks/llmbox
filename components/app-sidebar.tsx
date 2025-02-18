"use client";

import {
  Upload,
  MessageSquare,
  Tag,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  File,
  Book,
  ChartBar,
  Home,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

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

interface AppSidebarProps {
  projectId: string;
}

// Menu items.
const getMenuGroups = (projectId: string) => [
  {
    label: "Navigation",
    items: [
      {
        title: "Projects",
        url: "/",
        icon: Home,
      },
    ],
  },
  {
    label: "Dataset",
    items: [
      {
        title: "Dataset",
        url: `/${projectId}/dataset`,
        icon: File,
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
        title: "Evaluation Results",
        url: `/${projectId}/evaluation-results`,
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
];

export function AppSidebar({ projectId }: AppSidebarProps) {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const menuGroups = getMenuGroups(projectId);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between border-b px-4 py-3">
          {!isCollapsed && (
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">LLMBox</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <PanelLeft size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </Button>
        </div>
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
