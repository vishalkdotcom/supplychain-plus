import { resolveIcon } from "../icon-map";
import type { CalloutGridSection } from "../types";

const colorMap: Record<string, string> = {
  red: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400",
  green: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400",
  amber: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400",
  blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400",
};

const defaultColor = "bg-muted/50 border-border text-foreground";

export function CalloutGridSectionRenderer({ items }: CalloutGridSection) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = resolveIcon(item.icon);
        const colors = item.color ? (colorMap[item.color] ?? defaultColor) : defaultColor;
        return (
          <div
            key={item.title}
            className={`flex gap-3 rounded-lg border p-3 ${colors}`}
          >
            <Icon className="size-5 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-medium">{item.title}</div>
              <div className="mt-0.5 text-xs opacity-80">{item.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
