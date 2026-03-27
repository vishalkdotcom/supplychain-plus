"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { fetchAlerts, fetchBriefing, fetchCases, fetchMLInsights } from "@/lib/api";
import { Alert, MetricsBriefing, MLInsightsSummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconBell,
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowRight,
  IconAlertCircle,
  IconInfoCircle,
  IconCheck,
  IconClipboardList,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAlertRead } from "@/lib/api";
import { useView } from "@/components/view-context";
import { CreatePlanDialog, type RemediationSource } from "@/components/remediation/create-plan-dialog";

export function NeedsAttentionTabs() {
  const [activeTab, setActiveTab] = useQueryState(
    "attention",
    parseAsString.withDefault("alerts")
  );

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: () => fetchAlerts(true, 10),
    refetchInterval: 60000,
  });

  const { data: briefing } = useQuery<MetricsBriefing>({
    queryKey: ["briefing"],
    queryFn: () => fetchBriefing(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: mlInsights } = useQuery<MLInsightsSummary>({
    queryKey: ["ml-insights"],
    queryFn: fetchMLInsights,
    staleTime: 5 * 60 * 1000,
  });

  const alertCount = alerts?.length ?? 0;
  const urgentCount = briefing?.urgentCases?.length ?? 0;
  const movementCount = briefing?.riskMovements?.filter((m) => m.direction === "worsened").length ?? 0;
  const forecastCount = mlInsights?.risingForecastSuppliers?.length ?? 0;
  const totalForecasts = mlInsights?.totalForecasts ?? 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Needs Attention</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="alerts" className="text-xs gap-1">
              <IconBell className="h-3.5 w-3.5" />
              Alerts
              {alertCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-1">
                  {alertCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cases" className="text-xs gap-1">
              <IconAlertTriangle className="h-3.5 w-3.5" />
              Urgent
              {urgentCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-1">
                  {urgentCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-xs gap-1">
              <IconTrendingUp className="h-3.5 w-3.5" />
              Risk
              {movementCount > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1">
                  {movementCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="text-xs gap-1">
              <IconTrendingUp className="h-3.5 w-3.5" />
              Forecasts
              {totalForecasts > 0 && (
                <Badge variant={forecastCount > 0 ? "outline" : "secondary"} className="text-[10px] px-1.5 py-0 ml-1">
                  {forecastCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="mt-3">
            <ScrollArea className="h-[340px]">
              <AlertsTabContent />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="cases" className="mt-3">
            <ScrollArea className="h-[340px]">
              <UrgentCasesTabContent />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="risk" className="mt-3">
            <ScrollArea className="h-[340px]">
              <RiskMovementsTabContent />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="forecasts">
            <ScrollArea className="h-[340px]">
              {forecastCount === 0 ? (
                totalForecasts === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <IconInfoCircle className="h-8 w-8 mb-2" />
                    <p className="text-sm">Forecasts not generated yet</p>
                    <Link href="/operations/jobs">
                      <Button variant="link" size="sm" className="mt-1 text-xs">
                        Run forecast job →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <IconCheck className="h-8 w-8 mb-2" />
                    <p className="text-sm">All suppliers forecasted stable or improving</p>
                    <p className="text-xs mt-1">{totalForecasts} forecasts analyzed — no rising risk detected</p>
                  </div>
                )
              ) : (
                <div className="space-y-2 p-1">
                  {mlInsights?.risingForecastSuppliers.map((f) => (
                    <Link key={f.supplierId} href={`/suppliers/${f.supplierId}`} className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <IconTrendingUp className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-sm font-medium">{f.supplierName}</p>
                            <p className="text-xs text-muted-foreground">
                              Current: {f.currentRiskScore} → Predicted: {f.predictedRiskScore}
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-[10px]">
                          {f.trendDirection}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function AlertsTabContent() {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: () => fetchAlerts(true, 10),
    refetchInterval: 60000,
  });

  const markReadMutation = useMutation({
    mutationFn: (alertId: number) => markAlertRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const activeAlerts = alerts || [];
  if (activeAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <IconCheck className="w-10 h-10 text-green-300 mb-2" />
        <p className="font-medium text-sm">All caught up!</p>
        <p className="text-xs">No active alerts.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-lg border hover:bg-muted/30 transition-colors flex gap-3 group"
          >
            <div className="mt-0.5 shrink-0">
              {alert.severity === "critical" ? (
                <IconAlertCircle className="w-4 h-4 text-red-500" />
              ) : alert.severity === "warning" ? (
                <IconAlertCircle className="w-4 h-4 text-orange-500" />
              ) : (
                <IconInfoCircle className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/suppliers/${alert.supplierId}`}
                  className="font-medium text-sm hover:underline truncate"
                >
                  {alert.title}
                </Link>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {alert.message}
              </p>
              <div className="mt-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => {
                    setSelectedAlert(alert);
                    setDialogOpen(true);
                  }}
                >
                  <IconClipboardList className="w-3 h-3 mr-1" />
                  Create Plan
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => markReadMutation.mutate(alert.id)}
                  disabled={markReadMutation.isPending}
                >
                  <IconCheck className="w-3 h-3 mr-1" />
                  Acknowledge
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CreatePlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        source={selectedAlert ? {
          type: "alert",
          id: selectedAlert.id,
          title: `Remediate: ${selectedAlert.title}`,
          supplierId: selectedAlert.supplierId,
          supplierName: selectedAlert.supplierName ?? undefined,
          context: selectedAlert.message,
        } satisfies RemediationSource : undefined}
      />
    </>
  );
}

function UrgentCasesTabContent() {
  const { viewMode, currentBrandId, currentSupplierId } = useView();
  const { data: briefing, isLoading } = useQuery<MetricsBriefing>({
    queryKey: ["briefing"],
    queryFn: () => fetchBriefing(),
    staleTime: 5 * 60 * 1000,
  });

  // Also fetch high-severity cases as fallback, pre-computing ageDays at fetch time
  const { data: fallbackCases } = useQuery({
    queryKey: ["urgent-cases", viewMode, currentBrandId, currentSupplierId],
    queryFn: () =>
      fetchCases({
        severity: "high",
        perPage: 5,
        ...(viewMode === "brand" && currentBrandId ? { parentCompanyId: currentBrandId } : {}),
        ...(viewMode === "supplier" && currentSupplierId ? { supplierId: currentSupplierId } : {}),
      }),
    select: (res) => {
      const now = Date.now();
      return (res?.data || []).map((c) => ({
        id: c.id,
        supplierId: c.supplierId,
        supplierName: c.supplierName,
        topic: c.topic,
        severity: c.severity,
        status: c.status,
        aiSummary: c.aiSummary,
        createdAt: c.createdAt,
        ageDays: Math.floor((now - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // Prefer briefing urgent cases, fall back to fetched high-severity cases
  const urgentCases = briefing?.urgentCases && briefing.urgentCases.length > 0
    ? briefing.urgentCases
    : (fallbackCases || []);

  if (urgentCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <IconCheck className="w-10 h-10 text-green-300 mb-2" />
        <p className="font-medium text-sm">No urgent cases</p>
        <p className="text-xs">All high-severity cases are being handled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {urgentCases.map((c) => (
        <Link
          key={c.id}
          href={`/connect/${c.id}`}
          className="block p-3 rounded-lg border hover:bg-muted/30 transition-colors group"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm group-hover:text-primary transition-colors">
                {c.id}
              </span>
              <Badge variant="destructive" className="text-[10px]">
                {c.severity}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {c.status.replace("_", " ")}
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {c.ageDays}d ago
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {c.topic} &bull; {c.supplierName}
          </p>
          {c.aiSummary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.aiSummary}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

function RiskMovementsTabContent() {
  const { data: briefing, isLoading } = useQuery<MetricsBriefing>({
    queryKey: ["briefing"],
    queryFn: () => fetchBriefing(),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const movements = briefing?.riskMovements || [];

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <IconCheck className="w-10 h-10 text-green-300 mb-2" />
        <p className="font-medium text-sm">No significant movements</p>
        <p className="text-xs">Supplier risk scores are stable.</p>
      </div>
    );
  }

  const worsened = movements.filter((m) => m.direction === "worsened");

  const riskLevelColor = (score: number) => {
    if (score > 70) return { bg: "bg-red-500", text: "text-red-700 dark:text-red-400", label: "High" };
    if (score > 40) return { bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", label: "Medium" };
    return { bg: "bg-green-500", text: "text-green-700 dark:text-green-400", label: "Low" };
  };

  const renderMovement = (m: typeof movements[0]) => {
    const delta = m.currentScore - m.previousScore;
    const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
    const level = riskLevelColor(m.currentScore);
    const isWorsened = m.direction === "worsened";

    return (
      <Link
        key={m.supplierId}
        href={`/suppliers/${m.supplierId}`}
        className={`block p-3 rounded-lg border transition-colors group ${
          isWorsened
            ? "border-red-200 bg-red-50/50 hover:bg-red-50 dark:border-red-900/30 dark:bg-red-950/20 dark:hover:bg-red-950/30"
            : "border-green-200 bg-green-50/50 hover:bg-green-50 dark:border-green-900/30 dark:bg-green-950/20 dark:hover:bg-green-950/30"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isWorsened ? (
              <IconTrendingUp className="h-4 w-4 text-red-500 shrink-0" />
            ) : (
              <IconTrendingDown className="h-4 w-4 text-green-500 shrink-0" />
            )}
            <span className="font-medium text-sm group-hover:text-primary transition-colors truncate">
              {m.supplierName}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                isWorsened ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
              }`}
            >
              {deltaStr}
            </span>
            <span className={`text-xs font-semibold ${level.text}`}>
              {m.currentScore}
            </span>
          </div>
        </div>
        {/* Score bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${level.bg} transition-all`}
              style={{ width: `${Math.min(100, m.currentScore)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-16 text-right">
            {m.previousScore} → {m.currentScore}
          </span>
        </div>
        {m.crossedThreshold && (
          <Badge
            variant={isWorsened ? "destructive" : "secondary"}
            className="text-[10px] mt-1.5"
          >
            {isWorsened ? "Entered high risk" : "Left high risk"}
          </Badge>
        )}
      </Link>
    );
  };

  if (worsened.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <IconCheck className="w-10 h-10 text-green-300 mb-2" />
        <p className="font-medium text-sm">No worsening suppliers</p>
        <p className="text-xs">All supplier risk scores are stable or improving.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {worsened.map(renderMovement)}
    </div>
  );
}
