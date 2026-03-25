"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HelpButton } from "@/components/help";
import { QueueStatusBar } from "@/components/operations/queue-status-bar";
import { JobCards } from "@/components/operations/job-cards";
import { RunHistoryTable } from "@/components/operations/run-history-table";
import { SchedulesSection } from "@/components/operations/schedules-section";
import { ScheduleDialog } from "@/components/operations/schedule-dialog";
import { Button } from "@/components/ui/button";
import { IconPlayerPlay, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { useState } from "react";

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const queueStatus = useQuery({
    queryKey: ["queue-status"],
    queryFn: async () => {
      const res = await fetch("/api/jobs/queue/status");
      if (!res.ok) throw new Error("Failed to fetch queue status");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const runs = useQuery({
    queryKey: ["job-runs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs/runs?limit=50");
      if (!res.ok) throw new Error("Failed to fetch runs");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const schedules = useQuery({
    queryKey: ["job-schedules"],
    queryFn: async () => {
      const res = await fetch("/api/jobs/schedules");
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return res.json();
    },
  });

  const triggerMutation = useMutation({
    mutationFn: async (payload: { jobType?: string; all?: boolean }) => {
      const res = await fetch("/api/jobs/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to trigger job");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["queue-status"] });
      queryClient.invalidateQueries({ queryKey: ["job-runs"] });
    },
    onError: () => toast.error("Failed to trigger job"),
  });

  const cancelMutation = useMutation({
    mutationFn: async (runId: number) => {
      const res = await fetch(`/api/jobs/cancel/${runId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel job");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["queue-status"] });
      queryClient.invalidateQueries({ queryKey: ["job-runs"] });
    },
    onError: () => toast.error("Failed to cancel job"),
  });

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight mb-1">Jobs <HelpButton infographicId="inf-19" /></h1>
          <p className="text-muted-foreground text-sm">
            Monitor, trigger, and schedule ML batch jobs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScheduleDialogOpen(true)}
          >
            <IconPlus className="mr-1 h-4 w-4" />
            Schedule
          </Button>
          <Button
            size="sm"
            onClick={() => triggerMutation.mutate({ all: true })}
            disabled={triggerMutation.isPending}
          >
            <IconPlayerPlay className="mr-1 h-4 w-4" />
            Run All
          </Button>
        </div>
      </div>

      <QueueStatusBar data={queueStatus.data} isLoading={queueStatus.isLoading} />

      <JobCards
        runs={runs.data?.runs ?? []}
        queueStatus={queueStatus.data}
        onTrigger={(jobType) => triggerMutation.mutate({ jobType })}
        onCancel={(runId) => cancelMutation.mutate(runId)}
        isTriggering={triggerMutation.isPending}
      />

      <RunHistoryTable runs={runs.data?.runs ?? []} isLoading={runs.isLoading} />

      <SchedulesSection
        schedules={schedules.data ?? []}
        isLoading={schedules.isLoading}
      />

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      />
    </div>
  );
}
