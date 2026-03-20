"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchMLInsights } from "@/lib/api";
import { MLInsightsSummary } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconNetwork,
  IconTrendingUp,
  IconCurrencyDollar,
  IconMessageCircle,
  IconArrowRight,
} from "@tabler/icons-react";

export function MLInsightCards() {
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

  const forecastCount = insights?.risingForecastSuppliers?.length ?? 0;

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

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Systemic Patterns */}
      <Link href="/connect/clusters" className="group">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardContent className="p-4">
            <IconNetwork className="h-4 w-4 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{clusterCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Systemic Patterns
            </p>
            <p className="text-[10px] text-muted-foreground/70 line-clamp-1 mt-0.5">
              Top: {topCriticalLabel.replace(/^\d+\s+/, "")}
            </p>
            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-primary">View all</span>
              <IconArrowRight className="h-3 w-3 text-primary" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Forecast Alerts */}
      <Link href="/suppliers" className="group">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardContent className="p-4">
            <IconTrendingUp className="h-4 w-4 text-muted-foreground mb-2" />
            <div
              className={`text-2xl font-bold ${forecastCount > 0 ? "text-red-500" : ""}`}
            >
              {forecastCount}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              predicted to increase risk
            </p>
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-primary">Forecast Alerts</span>
              <IconArrowRight className="h-3 w-3 text-primary" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Wage Anomalies */}
      <Link href="/connect/payslip-anomalies" className="group">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardContent className="p-4">
            <IconCurrencyDollar className="h-4 w-4 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{totalAnomalies}</div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {criticalAnomalies} critical, {warningAnomalies} warning
            </p>
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-primary">Wage Anomalies</span>
              <IconArrowRight className="h-3 w-3 text-primary" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Voice Trends */}
      <Link href="/engage/voice-trends" className="group">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardContent className="p-4">
            <IconMessageCircle className="h-4 w-4 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{formattedSentiment}</div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {topTopicName}
            </p>
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-primary">Voice Trends</span>
              <IconArrowRight className="h-3 w-3 text-primary" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
