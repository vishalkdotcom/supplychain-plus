"use client";

import * as React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  IconBrandOpenai,
  IconBuilding,
  IconBuildingSkyscraper,
  IconChartBar,
  IconDashboard,
  IconMessage,
  IconPlayerPlay,
  IconSchool,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryNav = [
  {
    title: "Control Center",
    url: "/",
    icon: IconDashboard,
  },
  {
    title: "Brands",
    url: "/brands",
    icon: IconBuildingSkyscraper,
  },
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: IconBuilding,
  },
  {
    title: "AI Assistant",
    url: "/ai",
    icon: IconSparkles,
  },
];

const moduleNav = [
  {
    title: "Connect (Cases)",
    url: "/connect",
    icon: IconMessage,
  },
  {
    title: "Engage (Surveys)",
    url: "/engage",
    icon: IconChartBar,
  },
  {
    title: "Educate (Training)",
    url: "/educate",
    icon: IconSchool,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-sidebar-primary-foreground">
                  <IconBrandOpenai className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">WOVO AI</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url ||
                      pathname.startsWith(item.url + "/")
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moduleNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url ||
                      pathname.startsWith(item.url + "/")
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/operations")}
                  tooltip="Jobs"
                >
                  <Link href="/operations/jobs">
                    <IconPlayerPlay />
                    <span>Jobs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex w-full items-center justify-between px-2 py-1">
              <SidebarMenuButton asChild className="w-auto">
                <Link href="/settings">
                  <IconSettings className="mr-2" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
              <ModeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
