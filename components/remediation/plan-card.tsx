"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { IconArrowRight, IconUser, IconCalendar } from "@tabler/icons-react";
import { StatusPipeline } from "./status-pipeline";
import type { RemediationPlan } from "@/types";

function sourceTypeBadge(sourceType: string) {
  const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
    alert: "destructive",
    cluster: "default",
    anomaly: "secondary",
    monitoring_signal: "outline",
    manual: "outline",
  };
  return variants[sourceType] ?? "outline";
}

function daysOpen(createdAt: string, closedAt: string | null): number {
  const end = closedAt ? new Date(closedAt) : new Date();
  return Math.max(0, Math.floor((end.getTime() - new Date(createdAt).getTime()) / 86400000));
}

interface PlanCardProps {
  plan: RemediationPlan;
  supplierName?: string;
}

export function PlanCard({ plan, supplierName }: PlanCardProps) {
  const days = daysOpen(plan.createdAt, plan.closedAt);

  return (
    <Link
      href={`/remediation/${plan.id}`}
      className="block rounded-lg border p-4 space-y-3 hover:border-primary/50 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{plan.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={sourceTypeBadge(plan.sourceType)} className="text-xs">
              {plan.sourceType.replace(/_/g, " ")}
            </Badge>
            {plan.targetDate && new Date(plan.targetDate) < new Date() && plan.status !== "closed" && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
            {supplierName && (
              <span className="text-xs text-muted-foreground truncate">
                {supplierName}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {days}d open
            </span>
          </div>
        </div>
        <IconArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
      </div>

      <StatusPipeline status={plan.status} size="sm" />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {plan.assignedTo && (
          <span className="flex items-center gap-1">
            <IconUser className="h-3 w-3" />
            {plan.assignedTo}
          </span>
        )}
        {plan.targetDate && (
          <span className="flex items-center gap-1">
            <IconCalendar className="h-3 w-3" />
            {new Date(plan.targetDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </Link>
  );
}
