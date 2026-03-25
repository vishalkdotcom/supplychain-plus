import { IconAlertTriangle } from "@tabler/icons-react";
import type { ProblemSection } from "../types";

export function ProblemSectionRenderer({ text }: ProblemSection) {
  return (
    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
      <IconAlertTriangle className="size-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
      <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">{text}</p>
    </div>
  );
}
