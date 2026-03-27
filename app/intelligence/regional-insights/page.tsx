"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchRegionalInsights } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  IconWorld,
  IconAlertTriangle,
  IconUsers,
  IconChartBar,
  IconRefresh,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
  IconVolume3,
  IconVolumeOff,
  IconExternalLink,
  IconSparkles,
} from "@tabler/icons-react";
import { DataFreshnessBadge } from "@/components/data-freshness-badge";
import type {
  RegionalIssuePrevalence,
  PeerComparison,
  ContextualSilenceAlert,
  RegionalClusterOverlap,
} from "@/lib/db/schema";

// Severity styling
function severityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "warning":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
          Warning
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">Info</Badge>
      );
  }
}

function deviationCell(value: number) {
  if (Math.abs(value) < 1) {
    return <span className="text-muted-foreground">-</span>;
  }
  const isWorse = value > 0;
  return (
    <span
      className={
        isWorse
          ? "text-red-600 dark:text-red-400 font-medium"
          : "text-emerald-600 dark:text-emerald-400 font-medium"
      }
    >
      {isWorse ? "+" : ""}
      {value.toFixed(1)}
    </span>
  );
}

function riskColor(score: number) {
  if (score >= 70) return "text-red-600 dark:text-red-400";
  if (score >= 30) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

export default function RegionalInsightsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["regional-insights", selectedRegion],
    queryFn: () =>
      fetchRegionalInsights(
        selectedRegion !== "all" ? { region: selectedRegion } : {},
      ),
    staleTime: 5 * 60 * 1000,
  });

  const regions = data?.regions ?? [];
  const allRegionNames = data?.allRegions ?? [];
  const activeRegion =
    selectedRegion !== "all" ? regions[0] : null;

  async function handleRecompute() {
    try {
      const res = await fetch("/api/jobs/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobType: "regional-benchmarking" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Regional benchmarking job queued");
      setTimeout(() => refetch(), 8000);
    } catch {
      toast.error("Failed to trigger job");
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/intelligence">
                  Intelligence
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Regional Insights</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold tracking-tight">
            Regional Insights & Benchmarking
          </h1>
          <p className="text-sm text-muted-foreground">
            Compare suppliers against regional peers. Detect when silence is
            suspicious.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.computedAt && (
            <DataFreshnessBadge
              completedAt={data.computedAt}
              label="Regional Benchmarks"
            />
          )}
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {allRegionNames.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecompute}
            disabled={isRefetching}
          >
            <IconRefresh
              className={`mr-1 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Recompute
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {regions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <IconWorld className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No regional data yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Run the Regional Benchmarking job to compute peer comparisons.
            </p>
            <Button className="mt-4" onClick={handleRecompute}>
              <IconRefresh className="mr-2 h-4 w-4" /> Run Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Region Summary Cards */}
      {regions.length > 0 && !activeRegion && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {regions.map((r) => (
            <Card
              key={r.region}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedRegion(r.region)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconWorld className="h-4 w-4 text-muted-foreground" />
                  {r.region}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold">
                  {r.supplierCount}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    suppliers
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={riskColor(r.avgRiskScore)}>
                    Avg Risk: {r.avgRiskScore?.toFixed(0)}
                  </span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {r.highRiskCount > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      {r.highRiskCount} high-risk
                    </span>
                  )}
                  {r.silentCount > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                      {r.silentCount} silent
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed View for selected region */}
      {activeRegion && (
        <div className="space-y-6">
          {/* Region header card */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 border-indigo-200 dark:border-indigo-500/30">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <IconWorld className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold">{activeRegion.region}</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeRegion.supplierCount} suppliers | Avg Risk:{" "}
                    <span className={riskColor(activeRegion.avgRiskScore)}>
                      {activeRegion.avgRiskScore?.toFixed(0)}
                    </span>{" "}
                    | {activeRegion.highRiskCount} high-risk |{" "}
                    {activeRegion.silentCount} silent
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRegion("all")}
              >
                View All Regions
              </Button>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="issues">
            <TabsList>
              <TabsTrigger value="issues" className="gap-1">
                <IconAlertTriangle className="h-4 w-4" /> Issue Radar
              </TabsTrigger>
              <TabsTrigger value="peers" className="gap-1">
                <IconChartBar className="h-4 w-4" /> Peer Comparison
              </TabsTrigger>
              <TabsTrigger value="silence" className="gap-1">
                <IconVolumeOff className="h-4 w-4" /> Silence Alerts
                {activeRegion.silentCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {activeRegion.silentCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="clusters" className="gap-1">
                <IconUsers className="h-4 w-4" /> Cluster Overlap
              </TabsTrigger>
            </TabsList>

            {/* Issue Radar Tab */}
            <TabsContent value="issues" className="mt-4">
              <IssueRadarSection
                issues={activeRegion.issuePrevalence ?? []}
                region={activeRegion.region}
              />
            </TabsContent>

            {/* Peer Comparison Tab */}
            <TabsContent value="peers" className="mt-4">
              <PeerComparisonSection
                peers={activeRegion.peerComparisons ?? []}
                avgRiskScore={activeRegion.avgRiskScore}
              />
            </TabsContent>

            {/* Silence Alerts Tab */}
            <TabsContent value="silence" className="mt-4">
              <SilenceAlertsSection
                alerts={activeRegion.contextualSilenceAlerts ?? []}
                region={activeRegion.region}
              />
            </TabsContent>

            {/* Cluster Overlap Tab */}
            <TabsContent value="clusters" className="mt-4">
              <ClusterOverlapSection
                clusters={activeRegion.clusterOverlap ?? []}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// ===============================
// Issue Radar Section
// ===============================

function IssueRadarSection({
  issues,
  region,
}: {
  issues: RegionalIssuePrevalence[];
  region: string;
}) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No issue patterns detected in {region}.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Issue Prevalence in {region}
        </CardTitle>
        <CardDescription>
          Issue types sorted by how many cases they affect across the region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Issue Type</th>
                <th className="text-right py-2 px-4 font-medium">Cases</th>
                <th className="text-right py-2 px-4 font-medium">
                  Suppliers
                </th>
                <th className="text-center py-2 px-4 font-medium">
                  Severity
                </th>
                <th className="text-center py-2 pl-4 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, _i) => (
                <tr
                  key={issue.issueType}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="py-2.5 pr-4 font-medium">
                    {issue.issueType}
                  </td>
                  <td className="text-right py-2.5 px-4">{issue.count}</td>
                  <td className="text-right py-2.5 px-4">
                    {issue.supplierIds.length}
                  </td>
                  <td className="text-center py-2.5 px-4">
                    {severityBadge(issue.severity)}
                  </td>
                  <td className="text-center py-2.5 pl-4">
                    {issue.trend === "rising" && (
                      <IconArrowUp className="h-4 w-4 text-red-500 mx-auto" />
                    )}
                    {issue.trend === "falling" && (
                      <IconArrowDown className="h-4 w-4 text-emerald-500 mx-auto" />
                    )}
                    {(!issue.trend || issue.trend === "stable") && (
                      <IconMinus className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ===============================
// Peer Comparison Section
// ===============================

function PeerComparisonSection({
  peers,
  avgRiskScore,
}: {
  peers: PeerComparison[];
  avgRiskScore: number;
}) {
  if (peers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No peer comparison data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Supplier vs Regional Average</CardTitle>
        <CardDescription>
          Each supplier compared to the region. Positive deviation (red) means
          worse than average. Regional avg risk:{" "}
          <span className="font-semibold">{avgRiskScore.toFixed(0)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Supplier</th>
                <th className="text-right py-2 px-3 font-medium">
                  Risk
                </th>
                <th className="text-right py-2 px-3 font-medium">
                  <span className="text-xs opacity-60">vs avg</span>
                </th>
                <th className="text-right py-2 px-3 font-medium">Cases</th>
                <th className="text-right py-2 px-3 font-medium">Surveys</th>
                <th className="text-right py-2 px-3 font-medium">Training</th>
                <th className="text-right py-2 px-3 font-medium">
                  Engagement
                </th>
              </tr>
            </thead>
            <tbody>
              {peers.map((p) => (
                <tr
                  key={p.supplierId}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/suppliers/${p.supplierId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {p.supplierName}
                    </Link>
                  </td>
                  <td className="text-right py-2.5 px-3">
                    <span className={riskColor(p.riskScore)}>
                      {p.riskScore}
                    </span>
                  </td>
                  <td className="text-right py-2.5 px-3">
                    {deviationCell(p.deviations.risk)}
                  </td>
                  <td className="text-right py-2.5 px-3">
                    <span className="text-muted-foreground">
                      {p.caseScore}
                    </span>{" "}
                    {deviationCell(p.deviations.case)}
                  </td>
                  <td className="text-right py-2.5 px-3">
                    <span className="text-muted-foreground">
                      {p.surveyScore}
                    </span>{" "}
                    {deviationCell(p.deviations.survey)}
                  </td>
                  <td className="text-right py-2.5 px-3">
                    <span className="text-muted-foreground">
                      {p.trainingScore}
                    </span>{" "}
                    {deviationCell(p.deviations.training)}
                  </td>
                  <td className="text-right py-2.5 px-3">
                    <span className="text-muted-foreground">
                      {p.engagementScore}
                    </span>{" "}
                    {deviationCell(p.deviations.engagement)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ===============================
// Silence Alerts Section
// ===============================

function SilenceAlertsSection({
  alerts,
  region,
}: {
  alerts: ContextualSilenceAlert[];
  region: string;
}) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <IconVolume3 className="h-8 w-8 text-emerald-500 mb-2" />
          <p className="text-muted-foreground">
            All suppliers in {region} are actively reporting. No silence
            concerns.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        These suppliers are silent while{" "}
        <span className="font-semibold">
          {alerts[0]?.peerActiveCount ?? 0} peers
        </span>{" "}
        in {region} actively report issues.
      </p>
      {alerts.map((alert) => (
        <Card
          key={alert.supplierId}
          className={
            alert.severity === "critical"
              ? "border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5"
              : "border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5"
          }
        >
          <CardContent className="flex items-start gap-4 py-4">
            <IconVolumeOff
              className={`h-6 w-6 mt-0.5 ${
                alert.severity === "critical"
                  ? "text-red-500"
                  : "text-amber-500"
              }`}
            />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <Link
                  href={`/suppliers/${alert.supplierId}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {alert.supplierName}
                </Link>
                {severityBadge(alert.severity)}
                <Badge variant="outline">{alert.daysSilent} days silent</Badge>
              </div>
              {alert.peerIssues.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  While <strong>{alert.peerActiveCount} peers</strong> in the
                  region actively report:{" "}
                  <span className="font-medium text-foreground">
                    {alert.peerIssues.join(", ")}
                  </span>
                </p>
              )}
              <div className="pt-1">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/ai?q=Why is ${alert.supplierName} silent while peers in ${region} report ${alert.peerIssues.slice(0, 2).join(" and ")}?`}
                  >
                    <IconSparkles className="mr-1 h-3.5 w-3.5" />
                    Investigate
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ===============================
// Cluster Overlap Section
// ===============================

function ClusterOverlapSection({
  clusters,
}: {
  clusters: RegionalClusterOverlap[];
}) {
  if (clusters.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No systemic patterns overlap with this region.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Systemic Patterns in This Region
        </CardTitle>
        <CardDescription>
          Case clusters that affect suppliers in this region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clusters.map((c) => (
            <div
              key={c.clusterId}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {severityBadge(c.severity)}
                <div>
                  <Link
                    href={`/connect/clusters/${c.clusterId}`}
                    className="font-medium text-primary hover:underline text-sm"
                  >
                    {c.clusterLabel}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {c.caseCount} cases across {c.supplierCount} suppliers
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/connect/clusters/${c.clusterId}`}>
                  <IconExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
