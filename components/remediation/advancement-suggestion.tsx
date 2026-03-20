"use client";

import { Button } from "@/components/ui/button";
import { IconArrowRight, IconBulb } from "@tabler/icons-react";
import type { RemediationPlanDetail, RemediationStatus } from "@/types";

interface AdvancementSuggestionProps {
  plan: RemediationPlanDetail;
  onAdvance: (nextStatus: RemediationStatus) => void;
  isAdvancing?: boolean;
}

function getSuggestion(plan: RemediationPlanDetail): {
  message: string;
  nextStatus: RemediationStatus;
} | null {
  switch (plan.status) {
    case "detected":
      if (plan.rootCause) {
        return { message: "Root cause documented — consider advancing to Root Cause stage", nextStatus: "root_cause" };
      }
      return null;
    case "root_cause":
      if (plan.actionPlan) {
        return { message: "Action plan defined — consider advancing to Action Plan stage", nextStatus: "action_plan" };
      }
      return null;
    case "action_plan":
      if (plan.assignedTo && plan.targetDate) {
        return { message: "Plan assigned with deadline — consider advancing to Implementing", nextStatus: "implementing" };
      }
      return null;
    case "implementing":
      if (plan.evidence.length >= 3) {
        return { message: `${plan.evidence.length} evidence items collected — consider advancing to Verifying`, nextStatus: "verifying" };
      }
      return null;
    case "verifying": {
      const uniqueTypes = new Set(plan.evidence.map((e) => e.evidenceType));
      if (uniqueTypes.size >= 3 || plan.evidence.length >= 5) {
        return { message: "Evidence verified across multiple categories — consider closing this remediation", nextStatus: "closed" };
      }
      return null;
    }
    default:
      return null;
  }
}

export function AdvancementSuggestion({ plan, onAdvance, isAdvancing }: AdvancementSuggestionProps) {
  const suggestion = getSuggestion(plan);
  if (!suggestion) return null;

  return (
    <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
        <IconBulb className="h-4 w-4 shrink-0" />
        <span>{suggestion.message}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0"
        onClick={() => onAdvance(suggestion.nextStatus)}
        disabled={isAdvancing}
      >
        <IconArrowRight className="h-3.5 w-3.5 mr-1" />
        Advance
      </Button>
    </div>
  );
}
