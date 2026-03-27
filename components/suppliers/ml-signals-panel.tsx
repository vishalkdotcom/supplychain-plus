"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchClusters,
  fetchPayslipAnomalies,
  fetchVoiceTrends,
  fetchForecasts,
  fetchMonitoringSignals,
} from "@/lib/api";
import type { MonitoringSignal } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconNetwork,
  IconCurrencyDollar,
  IconMessageCircle,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconAlertTriangle,
  IconInfoCircle,
  IconRadar,
} from "@tabler/icons-react";
import { HelpButton } from "@/components/help";

interface MLSignalsPanelProps {
  supplierId: string;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "text-red-600 bg-red-50 dark:bg-red-950/30";
    case "warning":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
    default:
      return "text-blue-600 bg-blue-50 dark:bg-blue-950/30";
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return "destructive" as const;
    case "warning":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

export function MLSignalsPanel({ supplierId }: MLSignalsPanelProps) {
  const { data: clustersRes, isLoading: loadingClusters } = useQuery({
    queryKey: ["clusters", "supplier", supplierId],
    queryFn: () => fetchClusters({ supplierId, perPage: 50 }),
  });

  const { data: anomaliesRes, isLoading: loadingAnomalies } = useQuery({
    queryKey: ["payslip-anomalies", "supplier", supplierId],
    queryFn: () =>
      fetchPayslipAnomalies({ supplierId, perPage: 50, isResolved: "false" }),
  });

  const { data: voiceTrends, isLoading: loadingVoice } = useQuery({
    queryKey: ["voice-trends", "supplier", supplierId],
    queryFn: () => fetchVoiceTrends({ supplierId }),
  });

  const { data: forecasts, isLoading: loadingForecasts } = useQuery({
    queryKey: ["forecasts", "supplier", supplierId],
    queryFn: () => fetchForecasts({ supplierId }),
  });

  const { data: monitoringSignals, isLoading: loadingMonitoring } = useQuery({
    queryKey: ["monitoring-signals", "supplier", supplierId],
    queryFn: () => fetchMonitoringSignals({ supplierId }),
  });

  const clusters = clustersRes?.data ?? [];
  const anomalies = anomaliesRes?.data ?? [];
  const latestVoice = voiceTrends?.[0];
  const latestForecast = forecasts?.[0];
  const signals = monitoringSignals ?? [];

  const clusterCount = clusters.length;
  const anomalyCount = anomalies.length;
  const signalCount = signals.length;
  const hasVoice = !!latestVoice;
  const hasForecast = !!latestForecast;

  // If all empty and not loading, don't render
  const allLoading =
    loadingClusters && loadingAnomalies && loadingVoice && loadingForecasts && loadingMonitoring;
  const allEmpty = !allLoading && clusterCount === 0 && anomalyCount === 0 && !hasVoice && !hasForecast && signalCount === 0;

  if (allEmpty) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-base">
          ML Intelligence Signals
          <HelpButton infographicId="inf-05" />
        </CardTitle>
        <CardDescription>
          AI-detected patterns, anomalies, and trends for this supplier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="clusters">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clusters" className="text-xs gap-1">
              <IconNetwork className="h-3.5 w-3.5" />
              Patterns
              {clusterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {clusterCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="text-xs gap-1">
              <IconCurrencyDollar className="h-3.5 w-3.5" />
              Anomalies
              {anomalyCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
                  {anomalyCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="text-xs gap-1">
              <IconRadar className="h-3.5 w-3.5" />
              Monitoring
              {signalCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px]">
                  {signalCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs gap-1">
              <IconMessageCircle className="h-3.5 w-3.5" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs gap-1">
              <IconTrendingUp className="h-3.5 w-3.5" />
              Forecast
            </TabsTrigger>
          </TabsList>

          {/* Clusters Tab */}
          <TabsContent value="clusters" className="space-y-3 mt-3">
            {loadingClusters ? (
              <LoadingSkeleton />
            ) : clusters.length === 0 ? (
              <EmptyState message="No systemic patterns detected involving this supplier" />
            ) : (
              clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className={`rounded-lg border p-3 ${getSeverityColor(cluster.severity ?? "info")}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityBadge(cluster.severity ?? "info")}>
                          {cluster.severity}
                        </Badge>
                        <span className="text-sm font-medium">
                          {cluster.clusterLabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {cluster.aiSummary}
                      </p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{cluster.caseCount} cases</span>
                        <span>·</span>
                        <span>{cluster.supplierCount} suppliers</span>
                      </div>
                    </div>
                  </div>
                  {cluster.suggestedActions && (
                    <div className="mt-2 pt-2 border-t border-current/10">
                      <p className="text-xs font-medium mb-1">Suggested Actions:</p>
                      {cluster.suggestedActions
                        .slice(0, 2)
                        .map((action, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                            {action.urgency === "immediate" ? (
                              <IconAlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                            ) : (
                              <IconInfoCircle className="h-3 w-3 text-blue-500 shrink-0" />
                            )}
                            {action.action}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-3 mt-3">
            {loadingAnomalies ? (
              <LoadingSkeleton />
            ) : anomalies.length === 0 ? (
              <EmptyState message="No unresolved payslip anomalies for this supplier" />
            ) : (
              anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`rounded-lg border p-3 ${getSeverityColor(anomaly.severity)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityBadge(anomaly.severity)}>
                      {anomaly.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {anomaly.anomalyType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {anomaly.aiInterpretation}
                  </p>
                  {anomaly.details && (
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        Expected: {anomaly.details.currency}{" "}
                        {anomaly.details.expected}
                      </span>
                      <span>
                        Actual: {anomaly.details.currency}{" "}
                        {anomaly.details.actual}
                      </span>
                    </div>
                  )}
                  {anomaly.suggestedAction && (
                    <div className="mt-2 pt-2 border-t border-current/10">
                      <p className="text-xs flex items-center gap-1">
                        <IconAlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                        {anomaly.suggestedAction.action}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-3 mt-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-medium text-muted-foreground">Monitoring Signals</span>
              <HelpButton infographicId="inf-10" />
            </div>
            {loadingMonitoring ? (
              <LoadingSkeleton />
            ) : signals.length === 0 ? (
              <EmptyState message="No active monitoring signals for this supplier" />
            ) : (
              signals.map((signal: MonitoringSignal) => (
                <div
                  key={signal.id}
                  className={`rounded-lg border p-3 ${getSeverityColor(signal.severity)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityBadge(signal.severity)}>
                      {signal.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {signal.signalType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{signal.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {signal.description}
                  </p>
                  {signal.suggestedAction && (
                    <div className="mt-2 pt-2 border-t border-current/10">
                      <p className="text-xs flex items-center gap-1">
                        <IconAlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                        {signal.suggestedAction.action}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice" className="space-y-3 mt-3">
            {loadingVoice ? (
              <LoadingSkeleton />
            ) : !latestVoice ? (
              <EmptyState message="No voice trend data for this supplier" />
            ) : (
              <div className="space-y-3">
                {/* Sentiment Shift */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">
                    {latestVoice.sentimentShift != null && latestVoice.sentimentShift > 0 ? "+" : ""}
                    {latestVoice.sentimentShift?.toFixed(0) ?? "—"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sentiment Shift</p>
                    <p className="text-xs text-muted-foreground">
                      {latestVoice.month}
                    </p>
                  </div>
                </div>

                {/* Emerging Topics */}
                {(latestVoice.emergingTopics as Array<{ name: string; mentions: number; sentiment: string }> | null)?.length ? (
                  <div>
                    <p className="text-xs font-medium mb-2">Emerging Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(latestVoice.emergingTopics as Array<{ name: string; mentions: number; sentiment: string }>).map(
                        (topic, i) => (
                          <Badge
                            key={i}
                            variant={
                              topic.sentiment === "negative"
                                ? "destructive"
                                : topic.sentiment === "positive"
                                  ? "default"
                                  : "secondary"
                            }
                            className={topic.sentiment === "mixed" ? "text-amber-600 border-amber-300" : ""}
                          >
                            {topic.name} ({topic.mentions})
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Top Themes */}
                {(latestVoice.topThemes as Array<{ name: string; mentions: number; sentiment: string }> | null)?.length ? (
                  <div>
                    <p className="text-xs font-medium mb-2">Top Themes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(latestVoice.topThemes as Array<{ name: string; mentions: number; sentiment: string }>)
                        .slice(0, 5)
                        .map((theme, i) => (
                          <Badge key={i} variant="outline">
                            {theme.name} ({theme.mentions})
                          </Badge>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-3 mt-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-medium text-muted-foreground">Risk Forecast</span>
              <HelpButton infographicId="inf-11" />
            </div>
            {loadingForecasts ? (
              <LoadingSkeleton />
            ) : !latestForecast ? (
              <EmptyState message="No forecast data for this supplier" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {latestForecast.trendDirection === "rising" ? (
                      <IconTrendingUp className="h-5 w-5 text-red-500" />
                    ) : latestForecast.trendDirection === "falling" ? (
                      <IconTrendingDown className="h-5 w-5 text-green-500" />
                    ) : (
                      <IconMinus className="h-5 w-5 text-gray-500" />
                    )}
                    <div className="text-2xl font-bold">
                      {latestForecast.predictedRiskScore}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Predicted Risk (60 days)</p>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {Math.round((latestForecast.confidence ?? 0) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Sub-scores */}
                <div className="grid grid-cols-3 gap-2">
                  <ScorePreview
                    label="Cases"
                    value={latestForecast.predictedCaseScore ?? 0}
                  />
                  <ScorePreview
                    label="Surveys"
                    value={latestForecast.predictedSurveyScore ?? 0}
                  />
                  <ScorePreview
                    label="Training"
                    value={latestForecast.predictedTrainingScore ?? 0}
                  />
                </div>

                {/* AI Reasoning */}
                {latestForecast.aiReasoning && (
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <p className="text-xs font-medium mb-1">AI Analysis</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {latestForecast.aiReasoning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ScorePreview({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-2 rounded bg-muted/30">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
