"use client";

import { Button } from "@/components/ui/button";
import {
  IconSearch,
  IconClipboardList,
  IconProgress,
  IconEye,
  IconCircleCheckFilled,
  IconArrowRight,
} from "@tabler/icons-react";
import { HelpButton } from "@/components/help";
import {
  STATUS_STEPS as BASE_STEPS,
  getStatusIndex,
  getNextStatus,
} from "@/lib/remediation/status-steps";

export { getStatusIndex, getNextStatus };

const ICON_MAP: Record<string, typeof IconSearch> = {
  detected: IconSearch,
  root_cause: IconSearch,
  action_plan: IconClipboardList,
  implementing: IconProgress,
  verifying: IconEye,
  closed: IconCircleCheckFilled,
};

export const STATUS_STEPS = BASE_STEPS.map((step) => ({
  ...step,
  icon: ICON_MAP[step.key],
}));

interface StatusPipelineProps {
  status: string;
  onAdvance?: (nextStatus: string) => void;
  interactive?: boolean;
  isAdvancing?: boolean;
  size?: "sm" | "md";
}

export function StatusPipeline({
  status,
  onAdvance,
  interactive = false,
  isAdvancing = false,
  size = "sm",
}: StatusPipelineProps) {
  const currentIdx = getStatusIndex(status);
  const nextStatus = getNextStatus(status);

  if (size === "sm") {
    return (
      <div className="flex items-center gap-0.5">
        {STATUS_STEPS.map((step, idx) => (
          <div
            key={step.key}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              idx <= currentIdx ? "bg-green-500" : "bg-muted"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs font-medium text-muted-foreground">Remediation Pipeline</span>
        <HelpButton infographicId="inf-01" />
      </div>
      <div className="flex items-center gap-1">
        {STATUS_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-1 gap-1">
              <div className="flex flex-col items-center flex-1 gap-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    isComplete
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <span
                  className={`text-xs text-center ${
                    isCurrent ? "font-semibold text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded-full mb-5 ${
                    idx < currentIdx ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {interactive && nextStatus && onAdvance && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => onAdvance(nextStatus)}
            disabled={isAdvancing}
          >
            <IconArrowRight className="h-4 w-4 mr-1" />
            Advance to {STATUS_STEPS.find((s) => s.key === nextStatus)?.label}
          </Button>
        </div>
      )}
    </div>
  );
}
