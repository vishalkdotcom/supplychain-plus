"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconArrowRight,
  IconCircleCheck,
  IconExternalLink,
} from "@tabler/icons-react";
import type { RemediationPlan } from "@/types";
import {
  StatusPipeline,
  getNextStatus,
  STATUS_STEPS,
} from "@/components/remediation/status-pipeline";

interface RemediationTrackerProps {
  supplierId: string;
}

export function RemediationTracker({ supplierId }: RemediationTrackerProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["remediations", supplierId],
    queryFn: async () => {
      const res = await fetch(
        `/api/remediations?supplierId=${supplierId}&perPage=50`,
      );
      if (!res.ok) throw new Error("Failed to fetch remediations");
      const json = await res.json();
      return json.data as RemediationPlan[];
    },
  });

  const advanceMutation = useMutation({
    mutationFn: async ({
      id,
      nextStatus,
    }: {
      id: number;
      nextStatus: string;
    }) => {
      const res = await fetch(`/api/remediations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to advance status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remediations", supplierId] });
    },
  });

  const remediations = data ?? [];
  const active = remediations.filter((r) => r.status !== "closed");
  const closed = remediations.filter((r) => r.status === "closed");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Remediation Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (remediations.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Remediation Tracker</CardTitle>
            <CardDescription>
              {active.length} active, {closed.length} closed
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/remediation?supplierId=${supplierId}`}>
              View All
              <IconExternalLink className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {active.map((remediation) => (
          <RemediationCard
            key={remediation.id}
            remediation={remediation}
            onAdvance={(nextStatus) =>
              advanceMutation.mutate({
                id: remediation.id,
                nextStatus,
              })
            }
            isAdvancing={advanceMutation.isPending}
          />
        ))}
        {closed.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              {closed.length} resolved remediation{closed.length > 1 ? "s" : ""}
            </p>
            {closed.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 text-xs text-muted-foreground py-1"
              >
                <IconCircleCheck className="h-3.5 w-3.5 text-green-500" />
                <span className="line-through">{r.title}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RemediationCard({
  remediation,
  onAdvance,
  isAdvancing,
}: {
  remediation: RemediationPlan;
  onAdvance: (nextStatus: string) => void;
  isAdvancing: boolean;
}) {
  const nextStatus = getNextStatus(remediation.status);

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/remediation/${remediation.id}`}
            className="text-sm font-medium hover:underline"
          >
            {remediation.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {remediation.sourceType}
            </Badge>
            {remediation.assignedTo && (
              <span className="text-xs text-muted-foreground">
                Assigned: {remediation.assignedTo}
              </span>
            )}
          </div>
        </div>
        {nextStatus && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAdvance(nextStatus)}
            disabled={isAdvancing}
            className="text-xs shrink-0"
          >
            <IconArrowRight className="h-3 w-3 mr-1" />
            {STATUS_STEPS.find((s) => s.key === nextStatus)?.label}
          </Button>
        )}
      </div>

      <StatusPipeline status={remediation.status} size="sm" />

      {/* Details */}
      {remediation.rootCause && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Root cause:</span> {remediation.rootCause}
        </p>
      )}
      {remediation.actionPlan && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Action plan:</span> {remediation.actionPlan}
        </p>
      )}
    </div>
  );
}
