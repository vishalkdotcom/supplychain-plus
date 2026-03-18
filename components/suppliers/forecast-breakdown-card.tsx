"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchForecasts } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { IconTrendingUp, IconTrendingDown, IconMinus, IconChevronDown } from "@tabler/icons-react";
import { getScoreColor } from "@/lib/risk-utils";

interface ForecastBreakdownCardProps {
  supplierId: string;
}

export function ForecastBreakdownCard({ supplierId }: ForecastBreakdownCardProps) {
  const { data: forecasts, isLoading } = useQuery({
    queryKey: ["forecasts", supplierId],
    queryFn: () => fetchForecasts({ supplierId }),
  });

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full rounded-xl" />;
  }

  if (!forecasts || forecasts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>60-Day Risk Forecast</CardTitle>
          <CardDescription>AI-predicted risk trajectory and contributing factors</CardDescription>
        </CardHeader>
        <CardContent className="h-[100px] flex items-center justify-center text-muted-foreground">
          No forecast data available
        </CardContent>
      </Card>
    );
  }

  // Use the most recent (last) forecast entry
  const forecast = forecasts[forecasts.length - 1];

  const confidencePct = Math.round(forecast.confidence * 100);

  let TrendIcon = IconMinus;
  let trendVariant: "outline" | "secondary" | "destructive" = "secondary";
  let trendLabel = "Stable";

  if (forecast.trendDirection === "rising") {
    TrendIcon = IconTrendingUp;
    trendVariant = "destructive";
    trendLabel = "Rising";
  } else if (forecast.trendDirection === "falling") {
    TrendIcon = IconTrendingDown;
    trendVariant = "outline";
    trendLabel = "Falling";
  }

  const confidenceColor =
    confidencePct > 70
      ? "bg-green-500"
      : confidencePct >= 40
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <Card>
      <CardHeader>
        <CardTitle>60-Day Risk Forecast</CardTitle>
        <CardDescription>AI-predicted risk trajectory and contributing factors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Direction + Confidence */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Trend</span>
            <Badge variant={trendVariant} className="flex items-center gap-1">
              <TrendIcon className="w-3 h-3" />
              {trendLabel}
            </Badge>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[160px] max-w-xs">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Confidence {confidencePct}%
            </span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${confidenceColor}`}
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Predicted Sub-Scores */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Case Score</span>
            <div className="flex items-center gap-2">
              <Progress
                value={forecast.predictedCaseScore}
                className="h-2"
                style={{ "--progress-color": getScoreColor(forecast.predictedCaseScore) } as Record<string, string>}
              />
              <span className="text-sm font-semibold w-8 shrink-0">{forecast.predictedCaseScore}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Survey Score</span>
            <div className="flex items-center gap-2">
              <Progress
                value={forecast.predictedSurveyScore}
                className="h-2"
              />
              <span className="text-sm font-semibold w-8 shrink-0">{forecast.predictedSurveyScore}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Training Score</span>
            <div className="flex items-center gap-2">
              <Progress
                value={forecast.predictedTrainingScore}
                className="h-2"
              />
              <span className="text-sm font-semibold w-8 shrink-0">{forecast.predictedTrainingScore}</span>
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        {forecast.aiReasoning && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 px-0 h-auto text-sm font-medium">
                AI Reasoning
                <IconChevronDown className="w-4 h-4 transition-transform [[data-state=open]_&]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {forecast.aiReasoning}
              </p>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
