"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchActivities, fetchMLInsights } from "@/lib/api";
import { MLInsightsSummary } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconSparkles,
  IconMessage,
  IconChartBar,
  IconSchool,
  IconArrowRight,
} from "@tabler/icons-react";
import { getModuleColors } from "@/lib/risk-utils";

function getDynamicInsight(insights: MLInsightsSummary | undefined): { text: string; href: string } {
  if (!insights) {
    return {
      text: "Suppliers with high case volume also show declining survey sentiment — consider deploying targeted training to address root causes.",
      href: "",
    };
  }
  const criticalCount = insights.criticalClusters?.length ?? 0;
  if (criticalCount > 0) {
    const totalSuppliers = insights.criticalClusters.reduce((sum, c) => sum + (c.supplierCount || 0), 0);
    return {
      text: `Detected ${criticalCount} critical systemic patterns affecting ${totalSuppliers} suppliers. Review clusters to identify root causes.`,
      href: "/connect/clusters",
    };
  }
  const risingCount = insights.risingForecastSuppliers?.length ?? 0;
  if (risingCount > 0) {
    return {
      text: `${risingCount} supplier${risingCount > 1 ? "s" : ""} predicted to enter high-risk zone in the next 60 days based on trend analysis.`,
      href: "/suppliers",
    };
  }
  const totalAnomalies = (insights.unresolvedAnomalies?.critical ?? 0) + (insights.unresolvedAnomalies?.warning ?? 0) + (insights.unresolvedAnomalies?.info ?? 0);
  if (totalAnomalies > 0) {
    return {
      text: `${totalAnomalies} unresolved wage anomalies detected across your supply chain. ${insights.unresolvedAnomalies.critical} are critical severity.`,
      href: "/connect/payslip-anomalies",
    };
  }
  if (insights.globalSentimentShift !== 0) {
    const direction = insights.globalSentimentShift > 0 ? "improved" : "declined";
    return {
      text: `Global worker sentiment has ${direction} by ${Math.abs(insights.globalSentimentShift).toFixed(1)} points this month.${insights.topEmergingTopic ? ` Top emerging topic: "${insights.topEmergingTopic.name}".` : ""}`,
      href: "/engage/voice-trends",
    };
  }
  return {
    text: "Suppliers with high case volume also show declining survey sentiment — consider deploying targeted training to address root causes.",
    href: "",
  };
}

export function AICopilotFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });

  const { data: mlInsights } = useQuery<MLInsightsSummary>({
    queryKey: ["ml-insights"],
    queryFn: fetchMLInsights,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <IconSparkles className="h-5 w-5 text-primary" />
          AI Co-Pilot
        </CardTitle>
        <CardDescription>Automated actions and cross-module insights</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="px-4 pb-4">
              {/* Cross-Module Insight Highlight */}
              {(() => {
                const insight = getDynamicInsight(mlInsights);
                return (
                  <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <IconSparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Cross-Module Insight
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{insight.text}</p>
                    {insight.href && (
                      <Link href={insight.href} className="text-xs text-primary hover:underline mt-1 inline-block">
                        View details →
                      </Link>
                    )}
                  </div>
                );
              })()}

              <Separator className="mb-3" />

              {/* Activity Items */}
              <div className="space-y-3">
                {activities?.map((activity) => {
                  const href =
                    activity.linkedType === "supplier" && activity.supplierId
                      ? `/suppliers/${activity.supplierId}`
                      : activity.linkedType === "case" && activity.linkedId
                        ? `/connect/${activity.linkedId}`
                        : null;

                  const ModuleIcon =
                    activity.module === "connect"
                      ? IconMessage
                      : activity.module === "engage"
                        ? IconChartBar
                        : activity.module === "educate"
                          ? IconSchool
                          : IconSparkles;

                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div
                        className={`p-1.5 rounded-full shrink-0 ${getModuleColors(activity.module)}`}
                      >
                        <ModuleIcon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {activity.details}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {activity.module}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {activity.time}
                            </span>
                          </div>
                          {href && (
                            <Link href={href}>
                              <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                                Review
                                <IconArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
