"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { HelpButton } from "@/components/help";
import { QueueStatusBar } from "@/components/operations/queue-status-bar";
import { JobCards } from "@/components/operations/job-cards";
import { RunHistoryTable } from "@/components/operations/run-history-table";
import { SchedulesSection } from "@/components/operations/schedules-section";

export default function JobsPage() {
  const queueStatus = useQuery({
    queryKey: ["queue-status"],
    queryFn: async () => {
      const res = await fetch("/api/jobs/queue/status");
      if (!res.ok) throw new Error("Failed to fetch queue status");
      return res.json();
    },
    refetchInterval: 5000,
    placeholderData: keepPreviousData,
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

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight mb-1">Jobs <HelpButton infographicId="inf-19" /></h1>
          <p className="text-muted-foreground text-sm">
            Monitor scheduled ML batch jobs.
          </p>
        </div>
      </div>

      <QueueStatusBar data={queueStatus.data} isLoading={queueStatus.isLoading} />

      <JobCards
        runs={runs.data?.runs ?? []}
        queueStatus={queueStatus.data}
      />

      <RunHistoryTable runs={runs.data?.runs ?? []} isLoading={runs.isLoading} />

      <SchedulesSection
        schedules={schedules.data ?? []}
        isLoading={schedules.isLoading}
      />

    </div>
  );
}
