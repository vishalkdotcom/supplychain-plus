import { IconBulb } from "@tabler/icons-react";
import type { ExampleSection } from "../types";

export function ExampleSectionRenderer({ title, steps }: ExampleSection) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/10">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
        <IconBulb className="size-4" />
        {title}
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2 text-xs text-emerald-800/90 dark:text-emerald-200/90">
            <span className="shrink-0 font-mono text-emerald-600 dark:text-emerald-500">{i + 1}.</span>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
