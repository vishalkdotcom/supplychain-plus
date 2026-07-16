import { getDemoAsOfLabel, isDemoMode } from "@/lib/demo-mode/profile";
import { IconPresentation } from "@tabler/icons-react";

export function DemoModeBanner() {
  if (!isDemoMode()) return null;

  return (
    <div
      role="status"
      className="flex shrink-0 items-center justify-center gap-2 border-b border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-50"
    >
      <IconPresentation className="size-4 shrink-0 text-amber-700 dark:text-amber-300" />
      <span className="font-medium">Demo Mode</span>
      <span className="text-amber-800/50 dark:text-amber-200/50" aria-hidden>
        ·
      </span>
      <span className="text-amber-900/80 dark:text-amber-100/80">
        Data as of {getDemoAsOfLabel()}
      </span>
    </div>
  );
}
