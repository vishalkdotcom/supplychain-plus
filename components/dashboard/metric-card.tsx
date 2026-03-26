"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface MetricCardProps {
  title: string;
  icon: ReactNode;
  value: number | string;
  subtitle?: string;
  delta?: number;
  deltaLabel?: string;
  trend?: "up" | "down";
  trendIsPositive?: boolean; // true if "up" is good (e.g., sentiment), false if "up" is bad (e.g., risk)
  progress?: number; // 0-100 for progress bar display
  variant?: "default" | "urgent";
}

export function MetricCard({
  title,
  icon,
  value,
  subtitle,
  delta,
  deltaLabel = "vs 7 days ago",
  trend,
  trendIsPositive = true,
  progress,
  variant = "default",
}: MetricCardProps) {
  const isGoodTrend = trend
    ? trendIsPositive
      ? trend === "up"
      : trend === "down"
    : true;

  return (
    <Card className={variant === "urgent" ? "border-destructive/30 bg-destructive/5" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {delta !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={isGoodTrend ? "secondary" : "destructive"}
                    className="text-xs px-1.5 py-0"
                  >
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{deltaLabel}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-2 h-2" />
        )}
        {subtitle && (
          <div className="flex items-center gap-1 mt-1">
            {trend && (
              trend === "up" ? (
                <IconTrendingUp className={`h-3 w-3 ${isGoodTrend ? "text-green-600" : "text-red-600"}`} />
              ) : (
                <IconTrendingDown className={`h-3 w-3 ${isGoodTrend ? "text-green-600" : "text-red-600"}`} />
              )
            )}
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
