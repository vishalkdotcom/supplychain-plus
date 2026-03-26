"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconPlayerPlay,
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconLoader2,
  IconClock,
} from "@tabler/icons-react";
import {
  JOB_TYPES,
  JOB_LABELS,
  JOB_DESCRIPTIONS,
  EMBEDDING_JOBS,
} from "@/lib/jobs/constants";
import { formatDistanceToNow } from "date-fns";

interface JobRun {
  id: number;
  jobType: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  resultSummary: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
}

interface QueueItem {
  jobRunId: number;
  jobType: string;
  queueStatus: string;
}

interface QueueStatusData {
  running: QueueItem[];
  waiting: QueueItem[];
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

function getLatestRun(runs: JobRun[], jobType: string): JobRun | undefined {
  return runs.find((r) => r.jobType === jobType);
}

function getResultLabel(run: JobRun): string {
  const s = run.resultSummary;
  if (!s) return "";
  switch (run.jobType) {
    case "calculate-risk":
      return `${s.count ?? 0} suppliers scored`;
    case "case-clustering":
      return `${s.clustersCreated ?? 0} clusters found`;
    case "payslip-anomaly":
      return `${s.anomaliesDetected ?? 0} anomalies, ${s.anomaliesSaved ?? 0} saved`;
    case "risk-forecast":
      return `${s.suppliersForecasted ?? 0} suppliers forecast`;
    case "worker-voice-analytics":
      return `${s.suppliersProcessed ?? 0} suppliers processed`;
    case "analyze-surveys":
      return `${s.count ?? 0} surveys analyzed`;
    default:
      return JSON.stringify(s).slice(0, 60);
  }
}

function getJobStatus(
  jobType: string,
  runs: JobRun[],
  queueStatus?: QueueStatusData,
): "running" | "queued" | "completed" | "failed" | "cancelled" | "idle" {
  if (queueStatus?.running.some((r) => r.jobType === jobType)) return "running";
  if (queueStatus?.waiting.some((w) => w.jobType === jobType)) return "queued";
  const latest = getLatestRun(runs, jobType);
  if (!latest) return "idle";
  if (latest.status === "completed") return "completed";
  if (latest.status === "failed") return "failed";
  if (latest.status === "cancelled") return "cancelled";
  if (latest.status === "queued") return "queued";
  if (latest.status === "running") return "running";
  return "idle";
}

function getQueueRunId(
  jobType: string,
  queueStatus?: QueueStatusData,
): number | undefined {
  const item =
    queueStatus?.running.find((r) => r.jobType === jobType) ??
    queueStatus?.waiting.find((w) => w.jobType === jobType);
  return item?.jobRunId;
}

const statusConfig = {
  running: {
    icon: IconLoader2,
    iconClass: "h-4 w-4 animate-spin text-blue-500",
    badge: "default" as const,
    label: "Running",
  },
  queued: {
    icon: IconClock,
    iconClass: "h-4 w-4 text-yellow-500",
    badge: "secondary" as const,
    label: "Queued",
  },
  completed: {
    icon: IconCheck,
    iconClass: "h-4 w-4 text-green-500",
    badge: "outline" as const,
    label: "Completed",
  },
  failed: {
    icon: IconAlertTriangle,
    iconClass: "h-4 w-4 text-red-500",
    badge: "destructive" as const,
    label: "Failed",
  },
  cancelled: {
    icon: IconX,
    iconClass: "h-4 w-4 text-muted-foreground",
    badge: "secondary" as const,
    label: "Cancelled",
  },
  idle: {
    icon: IconClock,
    iconClass: "h-4 w-4 text-muted-foreground",
    badge: "secondary" as const,
    label: "Never run",
  },
};

export function JobCards({
  runs,
  queueStatus,
  onTrigger,
  onCancel,
  isTriggering,
}: {
  runs: JobRun[];
  queueStatus?: QueueStatusData;
  onTrigger: (jobType: string) => void;
  onCancel: (runId: number) => void;
  isTriggering: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {JOB_TYPES.map((jobType) => {
        const status = getJobStatus(jobType, runs, queueStatus);
        const config = statusConfig[status];
        const StatusIcon = config.icon;
        const latest = getLatestRun(runs, jobType);
        const queueRunId = getQueueRunId(jobType, queueStatus);
        const isActive = status === "running" || status === "queued";

        return (
          <Card key={jobType} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {JOB_LABELS[jobType]}
                </CardTitle>
                <Badge variant={config.badge} className="text-xs">
                  <StatusIcon className={config.iconClass} />
                  {config.label}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {JOB_DESCRIPTIONS[jobType]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latest && status !== "idle" && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {latest.durationMs != null && (
                    <p>Duration: {formatDuration(latest.durationMs)}</p>
                  )}
                  {latest.completedAt && (
                    <p>
                      {formatDistanceToNow(new Date(latest.completedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                  {latest.resultSummary && (
                    <p className="text-foreground/80 font-medium">
                      {getResultLabel(latest)}
                    </p>
                  )}
                  {latest.error && (
                    <p className="text-red-500 truncate" title={latest.error}>
                      {latest.error}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {EMBEDDING_JOBS.has(jobType) && (
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    Ollama Embeddings
                  </Badge>
                )}
                <div className="flex-1" />
                {isActive && queueRunId ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancel(queueRunId)}
                  >
                    <IconX className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTrigger(jobType)}
                    disabled={isTriggering || isActive}
                  >
                    <IconPlayerPlay className="h-3 w-3 mr-1" />
                    Run Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
