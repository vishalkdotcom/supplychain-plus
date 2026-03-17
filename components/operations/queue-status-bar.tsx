"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconLoader2, IconClock } from "@tabler/icons-react";
import { JOB_LABELS } from "@/lib/jobs/constants";
import type { JobType } from "@/lib/jobs/constants";

interface QueueItem {
  jobType: string;
  queueStatus: string;
  run?: { startedAt: string };
}

interface QueueStatusData {
  running: QueueItem[];
  waiting: QueueItem[];
  runningCount: number;
  waitingCount: number;
}

function formatElapsed(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
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
  if (isLoading) return <Skeleton className="h-14 w-full" />;
  if (!data || (data.runningCount === 0 && data.waitingCount === 0))
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
                ({formatElapsed(item.run.startedAt)})
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
      </CardContent>
    </Card>
  );
}
