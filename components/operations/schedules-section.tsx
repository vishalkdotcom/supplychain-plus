"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCalendarEvent, IconTrash } from "@tabler/icons-react";
import { JOB_LABELS } from "@/lib/jobs/constants";
import type { JobType } from "@/lib/jobs/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Schedule {
  id: number;
  jobType: string;
  cronExpression: string;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
}

export function SchedulesSection({
  schedules,
  isLoading,
}: {
  schedules: Schedule[];
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      enabled,
    }: {
      id: number;
      enabled: boolean;
    }) => {
      const res = await fetch(`/api/jobs/schedules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to update schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-schedules"] });
      toast.success("Schedule updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/jobs/schedules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-schedules"] });
      toast.success("Schedule deleted");
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <IconCalendarEvent className="h-4 w-4" />
          Schedules
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No schedules configured. Click &quot;+ Schedule&quot; to set up
            recurring jobs.
          </p>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">
                    {JOB_LABELS[schedule.jobType as JobType] ??
                      schedule.jobType}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {schedule.cronExpression}
                  </Badge>
                  <Badge
                    variant={schedule.enabled ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() =>
                      toggleMutation.mutate({
                        id: schedule.id,
                        enabled: !schedule.enabled,
                      })
                    }
                  >
                    {schedule.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {schedule.nextRunAt && (
                    <span className="text-xs text-muted-foreground">
                      Next: {new Date(schedule.nextRunAt).toLocaleString()}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(schedule.id)}
                  >
                    <IconTrash className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
