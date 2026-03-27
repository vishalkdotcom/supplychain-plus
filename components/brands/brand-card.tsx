"use client";

import type { Brand } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconBuildingSkyscraper,
  IconBuilding,
  IconArrowRight,
} from "@tabler/icons-react";
import { getRiskLevel, getRiskBadgeVariant } from "@/lib/risk-utils";

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  const level = getRiskLevel(brand.avgRiskScore);

  return (
    <Card className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <IconBuildingSkyscraper className="h-5 w-5 text-indigo-500 shrink-0" />
          <span className="truncate group-hover:text-indigo-600 transition-colors">
            {brand.name}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {brand.country && (
          <p className="text-sm text-muted-foreground">{brand.country}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <IconBuilding className="h-4 w-4" />
            <span>{brand.supplierCount} suppliers</span>
          </div>
          <Badge
            variant={getRiskBadgeVariant(level)}
            className="text-xs"
          >
            {level.toUpperCase()} {brand.avgRiskScore}
          </Badge>
        </div>
        <div className="flex justify-end">
          <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
