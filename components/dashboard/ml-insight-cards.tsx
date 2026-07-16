"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMLInsights } from "@/lib/api";
import { MLInsightsSummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconNetwork,
  IconTrendingUp,
  IconCurrencyDollar,
  IconMessageCircle,
} from "@tabler/icons-react";

import { DemoSafeLink } from "@/components/demo-safe-link";

export function MLInsightCards({ demoMode = false }: { demoMode?: boolean }) {
  const { data: insights, isLoading } = useQuery<MLInsightsSummary>({
    queryKey: ["ml-insights"],
    queryFn: fetchMLInsights,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-4 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const clusterCount = insights?.clusterCount ?? 0;
  const topCriticalLabel =
    insights?.criticalClusters?.[0]?.clusterLabel ?? "No critical patterns";
  const criticalCaseCount = insights?.criticalClusters?.reduce((sum, c) => sum + c.caseCount, 0) ?? 0;
  const criticalSupplierCount = insights?.criticalClusters?.reduce((sum, c) => sum + c.supplierCount, 0) ?? 0;

  const forecastCount = insights?.risingForecastSuppliers?.length ?? 0;
  const topRisingSupplier = insights?.risingForecastSuppliers?.[0];

  const totalAnomalies =
    (insights?.unresolvedAnomalies?.critical ?? 0) +
    (insights?.unresolvedAnomalies?.warning ?? 0) +
    (insights?.unresolvedAnomalies?.info ?? 0);
  const criticalAnomalies = insights?.unresolvedAnomalies?.critical ?? 0;
  const warningAnomalies = insights?.unresolvedAnomalies?.warning ?? 0;

  const sentimentShift = insights?.globalSentimentShift ?? 0;
  const formattedSentiment =
    sentimentShift >= 0
      ? `+${sentimentShift.toFixed(1)}`
      : sentimentShift.toFixed(1);
  const topTopicName = insights?.topEmergingTopic?.name ?? "No trend data";
  const sentimentLabel =
    sentimentShift >= 1 ? "Improving" :
    sentimentShift >= 0.3 ? "Slight improvement" :
    sentimentShift > -0.3 ? "Stable" :
    sentimentShift > -1 ? "Slight decline" :
    "Declining";

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Systemic Patterns */}
      <DemoSafeLink href="/connect/clusters" demoMode={demoMode} className="group">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Systemic Patterns</CardTitle>
            <IconNetwork className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clusterCount}</div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {criticalCaseCount > 0
                ? `${criticalCaseCount} cases across ${criticalSupplierCount} suppliers`
                : topCriticalLabel.replace(/^\d+\s+/, "")}
            </p>
          </CardContent>
        </Card>
      </DemoSafeLink>

      {/* Forecast Alerts */}
      <DemoSafeLink href="/suppliers" demoMode={demoMode} className="group">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast Alerts</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${forecastCount > 0 ? "text-red-500" : ""}`}>
              {forecastCount}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {forecastCount > 0
                ? `predicted to increase risk in 30 days`
                : "No rising risk forecasts"}
            </p>
            {topRisingSupplier && (
              <p className="text-[10px] text-muted-foreground/70 line-clamp-1 mt-0.5">
                Highest: {topRisingSupplier.supplierName} ({topRisingSupplier.predictedRiskScore})
              </p>
            )}
          </CardContent>
        </Card>
      </DemoSafeLink>

      {/* Wage Anomalies */}
      <DemoSafeLink href="/connect/payslip-anomalies" demoMode={demoMode} className="group">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wage Anomalies</CardTitle>
            <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnomalies}</div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              Unresolved: {criticalAnomalies} critical, {warningAnomalies} warning
            </p>
          </CardContent>
        </Card>
      </DemoSafeLink>

      {/* Voice Trends */}
      <DemoSafeLink href="/engage/voice-trends" demoMode={demoMode} className="group">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voice Trends</CardTitle>
            <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedSentiment}</div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {sentimentLabel} &middot; sentiment shift
            </p>
            <p className="text-[10px] text-muted-foreground/70 line-clamp-1 mt-0.5">
              Top: {topTopicName}{insights?.topEmergingTopic?.mentions ? ` (${insights.topEmergingTopic.mentions} mentions)` : ""}
            </p>
          </CardContent>
        </Card>
      </DemoSafeLink>
    </div>
  );
}
