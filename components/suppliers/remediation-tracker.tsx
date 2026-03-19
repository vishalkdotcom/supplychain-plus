"use client";

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
  IconSearch,
  IconClipboardList,
  IconProgress,
  IconEye,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

interface RemediationPlan {
  id: number;
  supplierId: string;
  title: string;
  status: string;
  sourceType: string;
  sourceId: number | null;
  rootCause: string | null;
  actionPlan: string | null;
  assignedTo: string | null;
  targetDate: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STEPS = [
  { key: "detected", label: "Detected", icon: IconSearch },
  { key: "root_cause", label: "Root Cause", icon: IconSearch },
  { key: "action_plan", label: "Action Plan", icon: IconClipboardList },
  { key: "implementing", label: "Implementing", icon: IconProgress },
  { key: "verifying", label: "Verifying", icon: IconEye },
  { key: "closed", label: "Closed", icon: IconCircleCheckFilled },
];

function getStatusIndex(status: string): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function getNextStatus(current: string): string | null {
  const idx = getStatusIndex(current);
  if (idx < 0 || idx >= STATUS_STEPS.length - 1) return null;
  return STATUS_STEPS[idx + 1].key;
}

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
  const currentIdx = getStatusIndex(remediation.status);
  const nextStatus = getNextStatus(remediation.status);

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{remediation.title}</p>
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

      {/* Status Pipeline */}
      <div className="flex items-center gap-0.5">
        {STATUS_STEPS.map((step, idx) => {
          const isComplete = idx <= currentIdx;
          return (
            <div key={step.key} className="flex items-center gap-0.5 flex-1">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  isComplete
                    ? "bg-green-500"
                    : "bg-muted"
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Detected</span>
        <span>{STATUS_STEPS[currentIdx]?.label}</span>
        <span>Closed</span>
      </div>

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
