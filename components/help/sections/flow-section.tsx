import { IconArrowRight, IconRefresh } from "@tabler/icons-react";
import { resolveIcon } from "../icon-map";
import type { FlowSection } from "../types";

function HorizontalFlow({ steps }: { steps: FlowSection["steps"] }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-2">
      {steps.map((step, i) => {
        const Icon = resolveIcon(step.icon);
        return (
          <div key={step.label} className="flex items-start gap-2">
            <div className="flex w-24 flex-col items-center text-center sm:w-28">
              <div className="flex size-10 items-center justify-center rounded-full border-2 border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Icon className="size-5" />
              </div>
              <div className="mt-1.5 text-xs font-semibold text-foreground">{step.label}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{step.description}</div>
            </div>
            {i < steps.length - 1 && (
              <IconArrowRight className="mt-2.5 size-4 shrink-0 text-muted-foreground/60" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CircularFlow({ steps }: { steps: FlowSection["steps"] }) {
  return (
    <div className="relative">
      {/* Central loop icon */}
      <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
        <IconRefresh className="size-5" />
      </div>
      {/* Steps in a responsive grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = resolveIcon(step.icon);
          const colors = [
            "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
            "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
            "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
          ];
          return (
            <div
              key={step.label}
              className={`rounded-lg border-2 p-3 text-center ${colors[i % colors.length]}`}
            >
              <Icon className="mx-auto size-6" />
              <div className="mt-1.5 text-sm font-bold">{step.label}</div>
              <div className="mt-1 text-xs opacity-80">{step.description}</div>
              {i < steps.length - 1 && (
                <div className="mt-2 text-xs font-medium opacity-60 sm:hidden">↓</div>
              )}
            </div>
          );
        })}
      </div>
      {/* Connecting arrows (desktop only) */}
      <div className="mt-2 hidden justify-center gap-1 text-xs text-muted-foreground sm:flex">
        <span>↻ Continuous feedback loop</span>
      </div>
    </div>
  );
}

export function FlowSectionRenderer({ steps, direction }: FlowSection) {
  return direction === "circular" ? (
    <CircularFlow steps={steps} />
  ) : (
    <HorizontalFlow steps={steps} />
  );
}
