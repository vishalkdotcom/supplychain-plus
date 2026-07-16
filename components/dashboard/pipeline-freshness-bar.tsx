"use client";

import { useQuery } from "@tanstack/react-query";
import { IconClock } from "@tabler/icons-react";
import { fetchFreshness } from "@/lib/api";
import { DataFreshnessBadge } from "@/components/data-freshness-badge";

const PIPELINES: { key: string; label: string }[] = [
  { key: "calculate-risk", label: "Risk" },
  { key: "analyze-surveys", label: "Surveys" },
  { key: "case-clustering", label: "Clusters" },
  { key: "payslip-anomaly", label: "Anomalies" },
  { key: "risk-forecast", label: "Forecasts" },
  { key: "worker-voice-analytics", label: "Voice" },
  { key: "generate-briefing", label: "Briefing" },
];

const DEMO_HIDDEN_PIPELINES = new Set(["analyze-surveys"]);

export function PipelineFreshnessBar({ demoMode = false }: { demoMode?: boolean }) {
  const { data: freshness } = useQuery({
    queryKey: ["freshness"],
    queryFn: fetchFreshness,
    staleTime: 60_000,
  });

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
      <span className="flex items-center gap-1 font-medium shrink-0">
        <IconClock className="h-3.5 w-3.5" />
        Data as of:
      </span>
      {PIPELINES.filter(({ key }) => !demoMode || !DEMO_HIDDEN_PIPELINES.has(key)).map(({ key, label }) => {
        const entry = freshness?.[key];
        return (
          <DataFreshnessBadge
            key={key}
            label={label}
            completedAt={entry?.completedAt ?? null}
            durationMs={entry?.durationMs}
          />
        );
      })}
    </div>
  );
}
