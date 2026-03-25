import type { StepListSection } from "../types";

export function StepListSectionRenderer({ title, steps }: StepListSection) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
              {step.number}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{step.label}</div>
              <div className="text-xs text-muted-foreground">{step.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
