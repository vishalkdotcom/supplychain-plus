"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSupplierHistory, fetchForecasts } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplierForecast } from "@/types";

interface RiskTrendChartProps {
  supplierId: string;
}

export function RiskTrendChart({ supplierId }: RiskTrendChartProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["supplierHistory", supplierId],
    queryFn: () => fetchSupplierHistory(supplierId),
  });

  const { data: forecasts } = useQuery({
    queryKey: ["forecasts", supplierId],
    queryFn: () => fetchForecasts({ supplierId }),
  });

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Trend</CardTitle>
          <CardDescription>Historical risk score data</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
          No historical data available yet.
        </CardContent>
      </Card>
    );
  }

  // Format historical data
  const historicalChartData = history.map((entry: { snapshotDate: string; riskScore: number; caseScore: number; surveyScore: number; }) => ({
    date: new Date(entry.snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    riskScore: entry.riskScore as number | null,
    caseScore: entry.caseScore,
    surveyScore: entry.surveyScore,
    forecastScore: null as number | null,
    upperBound: null as number | null,
    lowerBound: null as number | null,
    confidence: null as number | null,
  }));

  // Last historical point label for the reference line
  const todayLabel = historicalChartData.length > 0
    ? historicalChartData[historicalChartData.length - 1].date
    : undefined;

  // Merge forecast data
  let chartData = historicalChartData;
  if (forecasts && forecasts.length > 0) {
    // Last historical entry gets both riskScore and forecastScore to connect lines
    if (chartData.length > 0) {
      const lastIdx = chartData.length - 1;
      chartData[lastIdx] = {
        ...chartData[lastIdx],
        forecastScore: chartData[lastIdx].riskScore,
        upperBound: chartData[lastIdx].riskScore,
        lowerBound: chartData[lastIdx].riskScore,
      };
    }

    // Append forecast entries
    const forecastEntries = forecasts.map((f: SupplierForecast) => {
      const upper = Math.min(100, f.predictedRiskScore + (1 - f.confidence) * 15);
      const lower = Math.max(0, f.predictedRiskScore - (1 - f.confidence) * 15);
      return {
        date: new Date(f.forecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        riskScore: null as number | null,
        caseScore: 0,
        surveyScore: 0,
        forecastScore: f.predictedRiskScore as number | null,
        upperBound: upper as number | null,
        lowerBound: lower as number | null,
        confidence: f.confidence as number | null,
      };
    });

    chartData = [...chartData, ...forecastEntries];
  }

  // Calculate trend
  const latestScore = historicalChartData[historicalChartData.length - 1].riskScore ?? 0;
  const firstScore = historicalChartData[0].riskScore ?? 0;
  const scoreDiff = latestScore - firstScore;

  // Also check forecast trend
  const latestForecast = forecasts && forecasts.length > 0
    ? (forecasts as SupplierForecast[])[forecasts.length - 1]
    : null;

  let TrendIcon = IconMinus;
  let trendColor = "text-muted-foreground";
  let trendText = "No change";

  if (latestForecast) {
    if (latestForecast.trendDirection === "rising") {
      TrendIcon = IconTrendingUp;
      trendColor = "text-red-500";
      trendText = `Forecast: rising`;
    } else if (latestForecast.trendDirection === "falling") {
      TrendIcon = IconTrendingDown;
      trendColor = "text-green-500";
      trendText = `Forecast: falling`;
    } else {
      TrendIcon = IconMinus;
      trendColor = "text-muted-foreground";
      trendText = `Forecast: stable`;
    }
  } else if (scoreDiff > 0) {
    TrendIcon = IconTrendingUp;
    trendColor = "text-red-500";
    trendText = `Increased by ${scoreDiff} pts`;
  } else if (scoreDiff < 0) {
    TrendIcon = IconTrendingDown;
    trendColor = "text-green-500";
    trendText = `Decreased by ${Math.abs(scoreDiff)} pts`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Risk Trend</CardTitle>
          <CardDescription>30-day history + 60-day forecast</CardDescription>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor} bg-muted/30 px-2 py-1 rounded-md`}>
          <TrendIcon className="w-4 h-4" />
          <span>{trendText}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full min-h-[250px] mt-4">
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  const isForecast = d?.forecastScore != null && d?.riskScore == null;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
                      <p className="font-medium mb-1">{label}</p>
                      {isForecast ? (
                        <>
                          <p>Predicted Risk: <span className="font-semibold">{d.forecastScore}</span></p>
                          <p className="text-muted-foreground">
                            Range: {Math.round(d.lowerBound)} &ndash; {Math.round(d.upperBound)}
                          </p>
                          {d.confidence != null && (
                            <p className="text-muted-foreground">
                              Confidence: {Math.round(d.confidence * 100)}%
                            </p>
                          )}
                        </>
                      ) : (
                        payload
                          .filter((p: Record<string, unknown>) => p.value != null && p.dataKey !== "upperBound" && p.dataKey !== "lowerBound" && p.dataKey !== "confidence")
                          .map((p: Record<string, unknown>, i: number) => (
                            <p key={i} style={{ color: p.color as string }}>
                              {p.name as string}: <span className="font-semibold">{p.value as number}</span>
                            </p>
                          ))
                      )}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="riskScore"
                name="Overall Risk"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRisk)"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="forecastScore"
                name="Forecast"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorForecast)"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fillOpacity={0.1}
                fill="#3b82f6"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fillOpacity={0}
                fill="transparent"
                connectNulls={false}
              />
              {todayLabel && (
                <ReferenceLine x={todayLabel} stroke="#6b7280" strokeDasharray="3 3" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {forecasts && forecasts.length > 0 && (
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-0.5 bg-red-500 rounded" />
              Historical
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-0.5 bg-blue-500 rounded" style={{ borderBottom: "1px dashed" }} />
              Forecast
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-blue-500/10 rounded border border-blue-500/20" />
              Prediction range
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
