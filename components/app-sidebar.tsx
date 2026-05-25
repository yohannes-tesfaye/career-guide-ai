"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ListIcon,
  FolderIcon,
  UsersIcon,
  FileTextIcon,
  BookOpenIcon,
  CommandIcon,
} from "lucide-react";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Job Explorer",
    url: "/jobs",
    icon: <FolderIcon />,
  },
  {
    title: "Skill-Gap Analysis",
    url: "/skill-gap",
    icon: <ListIcon />,
  },
  {
    title: "Learning Paths",
    url: "/learning-path",
    icon: <BookOpenIcon />,
  },
  {
    title: "Resume Builder",
    url: "/resume",
    icon: <FileTextIcon />,
  },
  {
    title: "Profile & Skills",
    url: "/profile",
    icon: <UsersIcon />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Career Guide AI</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
