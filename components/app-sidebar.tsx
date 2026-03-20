"use client";

import * as React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  IconBrandOpenai,
  IconBuilding,
  IconBuildingSkyscraper,
  IconChartBar,
  IconChevronRight,
  IconDashboard,
  IconMessage,
  IconPlayerPlay,
  IconSchool,
  IconSettings,
  IconReportAnalytics,
  IconShieldCheck,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
    children: [
      { title: "Case Inbox", url: "/connect" },
      { title: "Systemic Patterns", url: "/connect/clusters" },
      { title: "Wage Anomalies", url: "/connect/payslip-anomalies" },
    ],
  },
  {
    title: "Engage (Surveys)",
    url: "/engage",
    icon: IconChartBar,
    children: [
      { title: "Surveys", url: "/engage" },
      { title: "Voice Trends", url: "/engage/voice-trends" },
    ],
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
              {moduleNav.map((item) =>
                item.children ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen={pathname.startsWith(item.url)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname.startsWith(item.url)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          <IconChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.url}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === child.url}
                                size="sm"
                              >
                                <Link href={child.url}>{child.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
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
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Govern</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/intelligence")}
                  tooltip="Intelligence"
                >
                  <Link href="/intelligence">
                    <IconReportAnalytics />
                    <span>Intelligence</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/remediation")}
                  tooltip="Remediation"
                >
                  <Link href="/remediation">
                    <IconShieldCheck />
                    <span>Remediation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
