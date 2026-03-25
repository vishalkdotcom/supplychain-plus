import { IconX, IconCheck } from "@tabler/icons-react";
import type { BeforeAfterSection } from "../types";

export function BeforeAfterSectionRenderer({ before, after }: BeforeAfterSection) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
          <IconX className="size-4" />
          {before.title}
        </div>
        <ul className="space-y-1.5">
          {before.items.map((item) => (
            <li key={item} className="flex gap-2 text-xs text-red-800/80 dark:text-red-300/80">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-red-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <IconCheck className="size-4" />
          {after.title}
        </div>
        <ul className="space-y-1.5">
          {after.items.map((item) => (
            <li key={item} className="flex gap-2 text-xs text-emerald-800/80 dark:text-emerald-300/80">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
