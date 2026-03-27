"use client";

import type { Supplier } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconBuilding,
  IconUsers,
  IconMapPin,
  IconArrowRight,
} from "@tabler/icons-react";
import { getRiskBadgeVariant } from "@/lib/risk-utils";

interface SupplierCardProps {
  supplier: Supplier;
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  const topReason = supplier.riskBreakdown.reasons[0];

  return (
    <Card className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <IconBuilding className="h-5 w-5 text-indigo-500 shrink-0" />
          <span className="truncate group-hover:text-indigo-600 transition-colors">
            {supplier.name}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconMapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{supplier.country}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <IconUsers className="h-4 w-4" />
            <span>{supplier.workerCount.toLocaleString()} workers</span>
          </div>
          <Badge
            variant={getRiskBadgeVariant(supplier.riskLevel)}
            className="text-xs"
          >
            {supplier.riskLevel.toUpperCase()} {supplier.riskScore}
          </Badge>
        </div>

        {topReason && (
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                topReason.impact === "high"
                  ? "bg-red-500"
                  : topReason.impact === "medium"
                  ? "bg-orange-500"
                  : "bg-yellow-500"
              }`}
            />
            <span className="text-xs text-muted-foreground line-clamp-1">
              {topReason.factor}
            </span>
          </div>
        )}

        <div className="flex justify-end">
          <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
