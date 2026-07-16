"use client";

import * as React from "react";
import Image from "next/image";
import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconChartBar,
  IconChevronRight,
  IconDashboard,
  IconMessage,
  IconPlayerPlay,
  IconSchool,
  IconReportAnalytics,
  IconShieldCheck,
  IconScale,
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
import { DemoUserSelector } from "@/components/demo-user-selector";

const DEMO_BLOCKED_URLS = new Set(["/connect", "/engage", "/educate"]);

type ModuleNavChild = {
  title: string;
  url: string;
};

type ModuleNavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: ModuleNavChild[];
};

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

const moduleNav: ModuleNavItem[] = [
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

function getVisibleModuleNav(demoMode: boolean): ModuleNavItem[] {
  if (!demoMode) return moduleNav;

  return moduleNav
    .map((item) => {
      if (item.children) {
        const children = item.children.filter(
          (child) => !DEMO_BLOCKED_URLS.has(child.url),
        );
        if (children.length === 0) return null;
        return { ...item, children };
      }

      if (DEMO_BLOCKED_URLS.has(item.url)) return null;
      return item;
    })
    .filter((item): item is ModuleNavItem => item !== null);
}

export function AppSidebar({
  demoMode = false,
  ...props
}: React.ComponentProps<typeof Sidebar> & { demoMode?: boolean }) {
  const pathname = usePathname();
  const visibleModuleNav = getVisibleModuleNav(demoMode);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image
                  src="/logo-mark.svg"
                  alt="WOVO+"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-semibold text-indigo-900 dark:text-indigo-100">WOVO<span className="text-indigo-500 dark:text-indigo-400">+</span></span>
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
              {visibleModuleNav.map((item) =>
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
              <Collapsible
                defaultOpen={pathname.startsWith("/intelligence")}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Intelligence"
                      isActive={pathname.startsWith("/intelligence")}
                    >
                      <IconReportAnalytics />
                      <span>Intelligence</span>
                      <IconChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === "/intelligence"}
                          size="sm"
                        >
                          <Link href="/intelligence">Briefing</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === "/intelligence/regional-insights"}
                          size="sm"
                        >
                          <Link href="/intelligence/regional-insights">Regional Insights</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/governance")}
                  tooltip="Regulatory Radar"
                >
                  <Link href="/governance/regulatory-radar">
                    <IconScale />
                    <span>Regulatory Radar</span>
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
            <DemoUserSelector />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
