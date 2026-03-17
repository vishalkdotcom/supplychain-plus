"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchCaseContext } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IconAlertTriangle, IconClock, IconFiles, IconHistory } from "@tabler/icons-react";

interface CaseContextStripProps {
  caseId: string;
  supplierId: string;
}

export function CaseContextStrip({ caseId, supplierId }: CaseContextStripProps) {
  const { data: context, isLoading } = useQuery({
    queryKey: ["case-context", caseId],
    queryFn: () => fetchCaseContext(caseId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex gap-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  if (!context) return null;

  const riskColor =
    context.supplierRiskLevel === "high"
      ? "text-red-600 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900"
      : context.supplierRiskLevel === "medium"
        ? "text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900"
        : "text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900";

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {/* Open cases at supplier */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/connect?supplierId=${supplierId}`}>
              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                <IconFiles className="h-3 w-3" />
                {context.supplierOpenCases} open case{context.supplierOpenCases !== 1 ? "s" : ""}
              </Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Open cases at this supplier</p>
          </TooltipContent>
        </Tooltip>

        {/* Supplier risk score */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`gap-1 ${riskColor}`}>
              <IconAlertTriangle className="h-3 w-3" />
              Risk: {context.supplierRiskScore}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Supplier risk score (0-100)</p>
          </TooltipContent>
        </Tooltip>

        {/* Case age */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1">
              <IconClock className="h-3 w-3" />
              {context.caseAgeDays}d old
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Days since case was created</p>
          </TooltipContent>
        </Tooltip>

        {/* Avg resolution time */}
        {context.avgResolutionDays != null && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1">
                <IconHistory className="h-3 w-3" />
                Avg resolve: {Math.round(context.avgResolutionDays)}d
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Average resolution time for similar cases</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
