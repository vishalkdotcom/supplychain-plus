"use client";

import type { Supplier } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconMapPin,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { getRiskColor, getRiskBadgeVariant, getImpactClasses } from "@/lib/risk-utils";

interface SupplierCardProps {
  supplier: Supplier;
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  const topReason = supplier.riskBreakdown.reasons[0];

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate group-hover:text-indigo-600 transition-colors">
              {supplier.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <IconMapPin className="h-3 w-3 shrink-0" />
              {supplier.country}
            </CardDescription>
          </div>
          <Badge variant={getRiskBadgeVariant(supplier.riskLevel)} className="shrink-0">
            {supplier.riskLevel.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Risk Score</span>
            <span className="font-semibold">{supplier.riskScore}/100</span>
          </div>
          <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all ${getRiskColor(
                supplier.riskLevel
              )}`}
              style={{ width: `${supplier.riskScore}%` }}
            />
          </div>
        </div>

        {/* Top Risk Reason */}
        {topReason && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
            <IconAlertTriangle
              className={`h-4 w-4 mt-0.5 shrink-0 ${
                topReason.impact === "high"
                  ? "text-red-500"
                  : topReason.impact === "medium"
                  ? "text-orange-500"
                  : "text-yellow-500"
              }`}
            />
            <span className="text-xs text-muted-foreground line-clamp-2">
              {topReason.factor}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <IconUsers className="h-4 w-4" />
            <span>{supplier.workerCount.toLocaleString()} workers</span>
          </div>
          <span className="text-xs">{supplier.region}</span>
        </div>
      </CardContent>
    </Card>
  );
}
