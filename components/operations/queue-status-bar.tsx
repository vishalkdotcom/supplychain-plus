"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconLoader2, IconClock, IconRefresh } from "@tabler/icons-react";
import { JOB_LABELS } from "@/lib/jobs/constants";
import type { JobType } from "@/lib/jobs/constants";

interface QueueItem {
  jobType: string;
  queueStatus: string;
  timeoutMs?: number | null;
  retryCount?: number;
  maxRetries?: number;
  retryAfter?: string | null;
  run?: { startedAt: string };
}

interface QueueStatusData {
  running: QueueItem[];
  waiting: QueueItem[];
  retrying?: QueueItem[];
  runningCount: number;
  waitingCount: number;
  retryingCount?: number;
}

function formatElapsed(startedAt: string, now: number): string {
  const ms = now - new Date(startedAt).getTime();
  if (ms < 0) return "0s";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

export function QueueStatusBar({
  data,
  isLoading,
}: {
  data?: QueueStatusData;
  isLoading: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  const hasRunning = (data?.runningCount ?? 0) > 0;

  useEffect(() => {
    if (!hasRunning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [hasRunning]);

  if (isLoading) return <Skeleton className="h-14 w-full" />;
  const retryingCount = data?.retryingCount ?? 0;
  if (!data || (data.runningCount === 0 && data.waitingCount === 0 && retryingCount === 0))
    return null;

  return (
    <Card>
      <CardContent className="py-3 px-4 flex flex-wrap items-center gap-4 text-sm">
        {data.running.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <IconLoader2 className="h-4 w-4 animate-spin" />
            <span className="font-medium">
              {JOB_LABELS[item.jobType as JobType] ?? item.jobType}
            </span>
            {item.run?.startedAt && (
              <span className="text-muted-foreground">
                ({formatElapsed(item.run.startedAt, now)}
                {item.timeoutMs && ` / ${Math.round(item.timeoutMs / 60_000)}m`})
              </span>
            )}
          </div>
        ))}
        {data.waitingCount > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconClock className="h-4 w-4" />
            <span>
              {data.waitingCount} queued:{" "}
              {data.waiting
                .map((w) => JOB_LABELS[w.jobType as JobType] ?? w.jobType)
                .join(", ")}
            </span>
          </div>
        )}
        {retryingCount > 0 && data.retrying && (
          <div className="flex items-center gap-2 text-orange-500">
            <IconRefresh className="h-4 w-4" />
            <span>
              {retryingCount} retrying:{" "}
              {data.retrying
                .map((r) => {
                  const label = JOB_LABELS[r.jobType as JobType] ?? r.jobType;
                  return `${label} (#${(r.retryCount ?? 0) + 1}/${(r.maxRetries ?? 2) + 1})`;
                })
                .join(", ")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
