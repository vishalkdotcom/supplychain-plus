import { createElement } from "react";
import { resolveIcon } from "../icon-map";
import type { HeroSection } from "../types";

export function HeroSectionRenderer({ title, subtitle, icon }: HeroSection) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
        {createElement(resolveIcon(icon), { className: "size-6" })}
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
