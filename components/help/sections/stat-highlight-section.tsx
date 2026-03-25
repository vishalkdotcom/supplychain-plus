import type { StatHighlightSection } from "../types";

export function StatHighlightSectionRenderer({ stats }: StatHighlightSection) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border bg-muted/50 p-3 text-center"
        >
          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
