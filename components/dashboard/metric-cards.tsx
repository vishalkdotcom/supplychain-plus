"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconArrowUp,
  IconArrowDown,
  IconMinus,
  IconMessage,
  IconChartBar,
  IconSchool,
  IconAlertTriangle,
  TablerIcon,
} from "@tabler/icons-react";

const icons: Record<string, TablerIcon> = {
  message: IconMessage,
  chart: IconChartBar,
  school: IconSchool,
  alert: IconAlertTriangle,
};

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
}

export function MetricCards({ metrics }: { metrics: MetricCardProps[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = icons[metric.icon] || IconMessage;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {metric.trend === "up" && (
                  <IconArrowUp className="h-3 w-3 text-green-500 mr-1" />
                )}
                {metric.trend === "down" && (
                  <IconArrowDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                {metric.trend === "neutral" && (
                  <IconMinus className="h-3 w-3 text-gray-500 mr-1" />
                )}
                <span
                  className={
                    metric.trend === "up"
                      ? "text-green-500"
                      : metric.trend === "down"
                      ? "text-red-500"
                      : ""
                  }
                >
                  {metric.change}
                </span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
