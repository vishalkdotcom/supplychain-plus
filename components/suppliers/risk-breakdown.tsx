"use client";

import type { Supplier } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  IconAlertTriangle,
  IconMessage,
  IconChartBar,
  IconSchool,
  IconActivity,
} from "@tabler/icons-react";

interface RiskBreakdownProps {
  supplier: Supplier;
}

export function RiskBreakdown({ supplier }: RiskBreakdownProps) {
  const { riskBreakdown, riskScore, riskLevel } = supplier;

  const getRiskColor = (score: number) => {
    if (score > 70) return "bg-red-500";
    if (score > 40) return "bg-orange-500";
    return "bg-green-500";
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "connect":
        return <IconMessage className="h-3.5 w-3.5" />;
      case "engage":
        return <IconChartBar className="h-3.5 w-3.5" />;
      case "educate":
        return <IconSchool className="h-3.5 w-3.5" />;
      default:
        return <IconActivity className="h-3.5 w-3.5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const scores = [
    { label: "Cases", value: riskBreakdown.caseScore, icon: IconMessage },
    { label: "Surveys", value: riskBreakdown.surveyScore, icon: IconChartBar },
    { label: "Training", value: riskBreakdown.trainingScore, icon: IconSchool },
    {
      label: "Engagement",
      value: riskBreakdown.engagementScore,
      icon: IconActivity,
    },
  ];

  return (
    <Card
      className={`border-2 ${
        riskLevel === "high"
          ? "border-red-200 bg-red-50/30"
          : riskLevel === "medium"
          ? "border-orange-200 bg-orange-50/30"
          : "border-green-200 bg-green-50/30"
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Why {riskLevel.toUpperCase()} Risk?</span>
          <span className="text-2xl font-bold">{riskScore}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Component Scores */}
        <div className="space-y-3">
          {scores.map((score) => (
            <div key={score.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <score.icon className="h-3.5 w-3.5" />
                  <span>{score.label}</span>
                </div>
                <span className="font-medium">{score.value}</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${getRiskColor(
                    score.value
                  )}`}
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Risk Reasons */}
        {riskBreakdown.reasons.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Contributing Factors
            </span>
            <div className="space-y-2">
              {riskBreakdown.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 p-2 rounded-md border ${getImpactColor(
                    reason.impact
                  )}`}
                >
                  <IconAlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{reason.factor}</p>
                    <p className="text-xs opacity-75 mt-0.5">
                      {reason.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {getModuleIcon(reason.module)}
                      <span className="text-xs capitalize">
                        {reason.module}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
