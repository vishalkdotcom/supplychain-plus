import type { RemediationStatus } from "@/types";

export const STATUS_STEPS: { key: RemediationStatus; label: string }[] = [
  { key: "detected", label: "Detected" },
  { key: "root_cause", label: "Root Cause" },
  { key: "action_plan", label: "Action Plan" },
  { key: "implementing", label: "Implementing" },
  { key: "verifying", label: "Verifying" },
  { key: "closed", label: "Closed" },
];

export function getStatusIndex(status: string): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export function getNextStatus(current: string): RemediationStatus | null {
  const idx = getStatusIndex(current);
  if (idx < 0 || idx >= STATUS_STEPS.length - 1) return null;
  return STATUS_STEPS[idx + 1].key;
}
