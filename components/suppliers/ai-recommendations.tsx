"use client";

import type { AIRecommendation } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconSparkles,
  IconAlertTriangle,
  IconClock,
  IconCalendar,
  IconArrowRight,
} from "@tabler/icons-react";

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
}

export function AIRecommendations({ recommendations }: AIRecommendationsProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "immediate":
        return "bg-red-100 text-red-700 border-red-200";
      case "this_week":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "this_month":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "immediate":
        return <IconAlertTriangle className="h-4 w-4" />;
      case "this_week":
        return <IconClock className="h-4 w-4" />;
      default:
        return <IconCalendar className="h-4 w-4" />;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "immediate":
        return "Immediate Action";
      case "this_week":
        return "This Week";
      case "this_month":
        return "This Month";
      default:
        return urgency;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "investigation":
        return "destructive" as const;
      case "remediation":
        return "default" as const;
      case "training":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  // Sort by urgency
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const urgencyOrder = { immediate: 0, this_week: 1, this_month: 2 };
    return (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3);
  });

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconSparkles className="h-5 w-5 text-indigo-600" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Suggested actions based on cross-module analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`flex items-start gap-3 p-4 rounded-lg border ${getUrgencyColor(
                rec.urgency
              )}`}
            >
              <div className="shrink-0 mt-0.5">
                {getUrgencyIcon(rec.urgency)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{rec.action}</span>
                </div>
                <p className="text-sm opacity-80">{rec.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={getCategoryBadge(rec.category)}
                    className="text-xs"
                  >
                    {rec.category}
                  </Badge>
                  <span className="text-xs opacity-60">
                    {getUrgencyLabel(rec.urgency)}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0">
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
