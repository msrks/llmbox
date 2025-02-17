"use client";

import {
  Upload,
  MessageSquare,
  Tag,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  ClipboardCheck,
  File,
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

// Menu items.
const items = [
  {
    title: "Dataset",
    url: "/",
    icon: File,
  },
  {
    title: "Labels",
    url: "/labels",
    icon: Tag,
  },
  {
    title: "Prompt Templates",
    url: "/prompts",
    icon: Sparkles,
  },
  {
    title: "Inspection Specs",
    url: "/inspection-specs",
    icon: ClipboardCheck,
  },
  {
    title: "Manual Upload",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
  },
];

export function AppSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Application</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="px-2">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
