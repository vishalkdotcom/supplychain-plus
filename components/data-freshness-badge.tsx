"use client";

import { IconClock } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatFreshnessAge, type FreshnessLevel } from "@/lib/format-age";

const DOT_COLORS: Record<FreshnessLevel, string> = {
  fresh: "bg-green-500",
  aging: "bg-amber-500",
  stale: "bg-red-500",
  never: "bg-gray-400",
};

function formatDuration(ms: number | null | undefined): string | null {
  if (ms == null) return null;
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return remSecs > 0 ? `${mins}m ${remSecs}s` : `${mins}m`;
}

interface DataFreshnessBadgeProps {
  completedAt: string | null;
  label?: string;
  durationMs?: number | null;
  className?: string;
}

export function DataFreshnessBadge({
  completedAt,
  label,
  durationMs,
  className,
}: DataFreshnessBadgeProps) {
  const { text, level } = formatFreshnessAge(completedAt);
  const duration = formatDuration(durationMs);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1.5 font-normal text-xs cursor-default ${className ?? ""}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${DOT_COLORS[level]}`} />
            {label && <span className="text-muted-foreground">{label}</span>}
            <span>{text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="space-y-0.5">
            {label && <p className="font-medium">{label}</p>}
            <p>
              {completedAt
                ? `Last run: ${new Date(completedAt).toLocaleString()}`
                : "No completed runs"}
            </p>
            {duration && <p>Duration: {duration}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
