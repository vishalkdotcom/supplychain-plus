import type { Supplier } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconAlertTriangle,
  IconMessage,
  IconChartBar,
  IconSchool,
  IconActivity,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react";

interface RiskBreakdownProps {
  supplier: Supplier;
  /** The oldest risk score from history, used to compute the trend badge. */
  previousRiskScore?: number;
}

export function RiskBreakdown({
  supplier,
  previousRiskScore,
}: RiskBreakdownProps) {
  const { riskBreakdown: rawRiskBreakdown, riskScore, riskLevel } = supplier;
  
  const riskBreakdown = rawRiskBreakdown || {
    caseScore: 50,
    surveyScore: 50,
    trainingScore: 50,
    engagementScore: 50,
    reasons: []
  };

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

  // Compute trend from real historical data (previousRiskScore prop)
  const trend =
    previousRiskScore != null && riskScore < previousRiskScore
      ? "improving"
      : previousRiskScore != null && riskScore > previousRiskScore
        ? "worsening"
        : "stable";

  return (
    <Card
      className={`border-2 h-full flex flex-col ${
        riskLevel === "high"
          ? "border-red-200 bg-red-50/30"
          : riskLevel === "medium"
            ? "border-orange-200 bg-orange-50/30"
            : "border-green-200 bg-green-50/30"
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Why {(riskLevel || "unknown").toUpperCase()} Risk?</span>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center text-sm font-normal px-2 py-0.5 rounded-full ${
                trend === "improving"
                  ? "bg-green-100 text-green-700"
                  : trend === "worsening"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {trend === "improving" && (
                <IconTrendingDown className="w-3 h-3 mr-1" />
              )}
              {trend === "worsening" && (
                <IconTrendingUp className="w-3 h-3 mr-1" />
              )}
              {trend === "stable" && <IconMinus className="w-3 h-3 mr-1" />}
              <span>
                {trend === "improving"
                  ? "Improving"
                  : trend === "worsening"
                    ? "Degrading"
                    : "Stable"}
              </span>
            </div>
            <span className="text-2xl font-bold">{riskScore}</span>
          </div>
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
                    score.value,
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
                    reason.impact,
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
