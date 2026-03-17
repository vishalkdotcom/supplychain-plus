"use client";

import { Fragment } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconLoader2,
  IconClock,
  IconHistory,
} from "@tabler/icons-react";
import { JOB_LABELS } from "@/lib/jobs/constants";
import type { JobType } from "@/lib/jobs/constants";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface JobRun {
  id: number;
  jobType: string;
  status: string;
  triggeredBy: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  resultSummary: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <IconCheck className="h-3.5 w-3.5 text-green-500" />,
  failed: <IconAlertTriangle className="h-3.5 w-3.5 text-red-500" />,
  running: <IconLoader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />,
  queued: <IconClock className="h-3.5 w-3.5 text-yellow-500" />,
  cancelled: <IconX className="h-3.5 w-3.5 text-muted-foreground" />,
};

export function RunHistoryTable({
  runs,
  isLoading,
}: {
  runs: JobRun[];
  isLoading: boolean;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <IconHistory className="h-4 w-4" />
          Run History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No job runs yet. Trigger a job to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Job</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Trigger</th>
                  <th className="pb-2 pr-4 font-medium">Duration</th>
                  <th className="pb-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <Fragment key={run.id}>
                    <tr
                      className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() =>
                        setExpandedId(expandedId === run.id ? null : run.id)
                      }
                    >
                      <td className="py-2.5 pr-4 font-medium">
                        {JOB_LABELS[run.jobType as JobType] ?? run.jobType}
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          {statusIcons[run.status]}
                          <span className="capitalize">{run.status}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="outline" className="text-[10px]">
                          {run.triggeredBy}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {run.durationMs != null
                          ? formatDuration(run.durationMs)
                          : "—"}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {formatDistanceToNow(new Date(run.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                    </tr>
                    {expandedId === run.id && (
                      <tr>
                        <td colSpan={5} className="p-3 bg-muted/30">
                          <div className="text-xs space-y-1">
                            <p>
                              <span className="text-muted-foreground">
                                Run ID:
                              </span>{" "}
                              #{run.id}
                            </p>
                            {run.startedAt && (
                              <p>
                                <span className="text-muted-foreground">
                                  Started:
                                </span>{" "}
                                {new Date(run.startedAt).toLocaleString()}
                              </p>
                            )}
                            {run.completedAt && (
                              <p>
                                <span className="text-muted-foreground">
                                  Completed:
                                </span>{" "}
                                {new Date(run.completedAt).toLocaleString()}
                              </p>
                            )}
                            {run.resultSummary && (
                              <div>
                                <span className="text-muted-foreground">
                                  Result:
                                </span>
                                <pre className="mt-1 p-2 rounded bg-muted text-xs overflow-x-auto">
                                  {JSON.stringify(run.resultSummary, null, 2)}
                                </pre>
                              </div>
                            )}
                            {run.error && (
                              <div>
                                <span className="text-red-500">Error:</span>
                                <pre className="mt-1 p-2 rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs overflow-x-auto">
                                  {run.error}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
