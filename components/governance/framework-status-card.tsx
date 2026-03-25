"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { FrameworkOverview } from "@/types";

interface FrameworkStatusCardProps {
  framework: FrameworkOverview;
}

export function FrameworkStatusCard({ framework }: FrameworkStatusCardProps) {
  const { supplierStats } = framework;
  const complianceRate =
    supplierStats.total > 0
      ? Math.round((supplierStats.compliant / supplierStats.total) * 100)
      : 0;

  const rateColor =
    complianceRate >= 80
      ? "text-green-600"
      : complianceRate >= 50
        ? "text-amber-600"
        : "text-red-600";

  const progressColor =
    complianceRate >= 80
      ? "[&>div]:bg-green-500"
      : complianceRate >= 50
        ? "[&>div]:bg-amber-500"
        : "[&>div]:bg-red-500";

  return (
    <Link href={`/governance/regulatory-radar/${framework.id}`}>
      <Card className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-sm font-semibold">{framework.shortName}</div>
              <div className="text-xs text-muted-foreground">
                {framework.jurisdiction}
              </div>
            </div>
            <span className={`text-lg font-bold ${rateColor}`}>
              {complianceRate}%
            </span>
          </div>

          <Progress value={complianceRate} className={`h-1.5 mb-2 ${progressColor}`} />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {supplierStats.compliant}/{supplierStats.total} compliant
            </span>
            {framework.nextDeadline && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Due {new Date(framework.nextDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
