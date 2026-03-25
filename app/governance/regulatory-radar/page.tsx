"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFrameworks, fetchComplianceMatrix } from "@/lib/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconScale,
  IconBuilding,
  IconPercentage,
  IconCalendarDue,
} from "@tabler/icons-react";
import { FrameworkStatusCard } from "@/components/governance/framework-status-card";
import { ComplianceMatrix } from "@/components/governance/compliance-matrix";

export default function RegulatoryRadarPage() {
  const { data: frameworks, isLoading: fwLoading } = useQuery({
    queryKey: ["regulatory-frameworks"],
    queryFn: fetchFrameworks,
  });

  const { data: compliance, isLoading: compLoading } = useQuery({
    queryKey: ["regulatory-compliance"],
    queryFn: () => fetchComplianceMatrix(),
  });

  const isLoading = fwLoading || compLoading;

  // Compute stats
  const totalFrameworks = frameworks?.length ?? 0;
  const totalSuppliers = new Set(compliance?.map((c) => c.supplierId) ?? []).size;
  const overallCompliance =
    compliance && compliance.length > 0
      ? Math.round(
          (compliance.filter((c) => c.status === "compliant").length / compliance.length) * 100,
        )
      : 0;
  const upcomingDeadlines =
    frameworks?.filter((fw) => {
      if (!fw.nextDeadline) return false;
      const deadline = new Date(fw.nextDeadline);
      const now = new Date();
      const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      return deadline >= now && deadline <= sixMonths;
    }).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Control Center</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Regulatory Radar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <IconScale className="w-6 h-6 text-indigo-500" />
          Regulatory Radar
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track compliance across regulatory frameworks for your supply chain
        </p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon={<IconScale className="w-5 h-5 text-indigo-500" />}
            label="Frameworks Tracked"
            value={totalFrameworks}
          />
          <StatCard
            icon={<IconBuilding className="w-5 h-5 text-blue-500" />}
            label="Suppliers Assessed"
            value={totalSuppliers}
          />
          <StatCard
            icon={<IconPercentage className="w-5 h-5 text-green-500" />}
            label="Overall Compliance"
            value={`${overallCompliance}%`}
          />
          <StatCard
            icon={<IconCalendarDue className="w-5 h-5 text-amber-500" />}
            label="Upcoming Deadlines"
            value={upcomingDeadlines}
          />
        </div>
      )}

      {/* Main content: 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compliance Matrix */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compliance Matrix</CardTitle>
            <CardDescription>
              Supplier compliance status across all frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ComplianceMatrix
                frameworks={frameworks ?? []}
                compliance={compliance ?? []}
              />
            )}
          </CardContent>
        </Card>

        {/* Right: Framework cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Frameworks
          </h2>
          {isLoading ? (
            <>
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </>
          ) : (
            frameworks?.map((fw) => (
              <FrameworkStatusCard key={fw.id} framework={fw} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
