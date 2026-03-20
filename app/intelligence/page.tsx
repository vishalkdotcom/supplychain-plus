"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchIntelligencePage } from "@/lib/api";
import type { BriefingAttentionItem } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
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
  IconAlertTriangle,
  IconEye,
  IconTrendingUp,
  IconSparkles,
  IconRefresh,
  IconAlertCircle,
  IconCircleCheck,
  IconArrowUp,
  IconArrowDown,
  IconExternalLink,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { DataFreshnessBadge } from "@/components/data-freshness-badge";

// Reuse severity configuration from intelligence-briefing component
const SEVERITY_CONFIG = {
  critical: {
    icon: IconAlertTriangle,
    label: "CRITICAL",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    borderColor: "border-red-200 dark:border-red-500/30",
  },
  watch: {
    icon: IconEye,
    label: "WATCH",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    borderColor: "border-amber-200 dark:border-amber-500/30",
  },
  positive: {
    icon: IconTrendingUp,
    label: "POSITIVE",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    borderColor: "border-green-200 dark:border-green-500/30",
  },
} as const;

const SEVERITY_ORDER: Array<BriefingAttentionItem["severity"]> = [
  "critical",
  "watch",
  "positive",
];

function StatCard({
  title,
  value,
  icon: Icon,
  urgent,
}: {
  title: string;
  value: number | string;
  icon: typeof IconAlertCircle;
  urgent?: boolean;
}) {
  return (
    <Card className={urgent ? "border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{title}</p>
          <Icon className={`h-4 w-4 ${urgent ? "text-red-500" : "text-muted-foreground"}`} />
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function IntelligenceBriefingPage() {
  const [selectedBriefingId, setSelectedBriefingId] = useState<number | undefined>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["intelligence-page", selectedBriefingId],
    queryFn: () => fetchIntelligencePage(selectedBriefingId),
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/jobs/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobType: "generate-briefing" }),
      });
      if (!res.ok) throw new Error("Failed to trigger briefing generation");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Briefing regeneration queued. Data will refresh shortly.");
      // Refetch after giving the job time to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["intelligence-page"] });
      }, 8000);
    },
    onError: () => {
      toast.error("Failed to regenerate briefing");
    },
  });

  const current = data?.current;
  const metrics = data?.metrics;
  const history = data?.history ?? [];

  // Group attention items by severity
  const groupedItems = SEVERITY_ORDER.map((severity) => ({
    severity,
    items: (current?.attentionItems ?? []).filter((item) => item.severity === severity),
  })).filter((g) => g.items.length > 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Empty state — no briefings ever generated
  if (!current && data?.stale) {
    return (
      <div className="flex-1 p-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Intelligence Briefing</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6">
            <IconReportAnalytics className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No briefing generated yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Run the intelligence briefing pipeline to aggregate insights from risk scores,
            case clusters, voice trends, and monitoring signals.
          </p>
          <Button
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
          >
            <IconSparkles className="h-4 w-4 mr-2" />
            Generate First Briefing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Intelligence Briefing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold">Intelligence Briefing</h1>
        </div>
        <div className="flex items-center gap-3">
          {current?.generatedAt && (
            <DataFreshnessBadge
              completedAt={current.generatedAt}
              label="Briefing"
            />
          )}
          {history.length > 1 && (
            <Select
              value={selectedBriefingId?.toString() ?? "latest"}
              onValueChange={(v) =>
                setSelectedBriefingId(v === "latest" ? undefined : parseInt(v))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Latest briefing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest briefing</SelectItem>
                {history.map((h) => (
                  <SelectItem key={h.id} value={h.id.toString()}>
                    {new Date(h.generatedAt).toLocaleDateString()} ({h.itemCount} items)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
          >
            <IconRefresh
              className={`h-4 w-4 mr-2 ${regenerateMutation.isPending ? "animate-spin" : ""}`}
            />
            Regenerate
          </Button>
        </div>
      </div>

      {/* AI Summary Banner */}
      {metrics?.summary && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-indigo-200 dark:border-indigo-500/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <IconSparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  Executive Summary
                </p>
                <p className="text-sm text-muted-foreground">
                  {metrics.summary}
                </p>
                {current?.generatedAt && (
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    Cross-database intelligence from cases, risk analytics, voice surveys, and monitoring signals
                    — updated {formatDistanceToNow(new Date(current.generatedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Attention Items"
            value={current?.attentionItems?.length ?? 0}
            icon={IconReportAnalytics}
          />
          <StatCard
            title="New Alerts"
            value={metrics.newAlerts}
            icon={IconAlertCircle}
            urgent={metrics.newAlerts > 0}
          />
          <StatCard
            title="High Risk Suppliers"
            value={metrics.newHighRiskSuppliers}
            icon={IconAlertTriangle}
            urgent={metrics.newHighRiskSuppliers > 0}
          />
          <StatCard
            title="Urgent Cases"
            value={metrics.escalatedCases}
            icon={IconAlertCircle}
            urgent={metrics.escalatedCases > 0}
          />
          <StatCard
            title="Cases Resolved"
            value={metrics.resolvedCases}
            icon={IconCircleCheck}
          />
          <StatCard
            title="Risk Movements"
            value={metrics.riskMovements.length}
            icon={IconTrendingUp}
          />
        </div>
      )}

      {/* Two-column content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Attention Items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Attention Items</h2>
          {groupedItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No attention items in this briefing.
              </CardContent>
            </Card>
          ) : (
            groupedItems.map(({ severity, items }) => (
              <div key={severity} className="space-y-3">
                {items.map((item, i) => {
                  const config = SEVERITY_CONFIG[item.severity];
                  const Icon = config.icon;
                  return (
                    <Card
                      key={`${severity}-${i}`}
                      className={`${config.bgColor} ${config.borderColor}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <span
                                className={`text-[10px] font-bold tracking-wider ${config.color}`}
                              >
                                {config.label}
                              </span>
                              {item.metric && (
                                <Badge variant="outline" className="text-xs font-normal">
                                  {item.metric}
                                </Badge>
                              )}
                              {item.region && (
                                <Badge variant="secondary" className="text-xs font-normal">
                                  {item.region}
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          </div>
                          <Link
                            href={`/ai?q=${encodeURIComponent(item.query)}`}
                            className="flex-shrink-0"
                          >
                            <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400">
                              Investigate <IconExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Right: Risk Movements + Urgent Cases */}
        <div className="space-y-6">
          {/* Risk Movements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Risk Movements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!metrics?.riskMovements?.length ? (
                <p className="text-sm text-muted-foreground">No significant movements.</p>
              ) : (
                metrics.riskMovements.map((m) => (
                  <div key={m.supplierId} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/suppliers/${m.supplierId}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {m.supplierName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{m.previousScore}</span>
                      {m.direction === "worsened" ? (
                        <IconArrowUp className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <IconArrowDown className="h-3.5 w-3.5 text-green-500" />
                      )}
                      <span
                        className={`text-xs font-semibold ${m.direction === "worsened" ? "text-red-600" : "text-green-600"}`}
                      >
                        {m.currentScore}
                      </span>
                      {m.crossedThreshold && (
                        <Badge variant="destructive" className="text-[10px] px-1 py-0">
                          70
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Urgent Cases */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Urgent Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!metrics?.urgentCases?.length ? (
                <p className="text-sm text-muted-foreground">No urgent cases.</p>
              ) : (
                metrics.urgentCases.map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/connect/${c.id.replace("CASE-", "")}`}
                        className="text-sm font-medium hover:underline truncate"
                      >
                        {c.topic}
                      </Link>
                      <Badge
                        variant={c.severity === "high" ? "destructive" : "default"}
                        className="text-[10px] flex-shrink-0"
                      >
                        {c.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Link href={`/suppliers/${c.supplierId}`} className="hover:underline">
                        {c.supplierName}
                      </Link>
                      <span>{c.ageDays}d old</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/remediation">
                  <IconCircleCheck className="h-4 w-4 mr-2" />
                  View Remediation Plans
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/ai">
                  <IconSparkles className="h-4 w-4 mr-2" />
                  Ask AI Assistant
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/connect/clusters">
                  <IconEye className="h-4 w-4 mr-2" />
                  Review Systemic Patterns
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
