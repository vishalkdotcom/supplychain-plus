"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { JOB_TYPES, JOB_LABELS } from "@/lib/jobs/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

const CRON_PRESETS = [
  { label: "Daily at 2:00 AM", value: "0 2 * * *" },
  { label: "Daily at 6:00 AM", value: "0 6 * * *" },
  { label: "Every 12 hours", value: "0 */12 * * *" },
  { label: "Weekly on Monday 3:00 AM", value: "0 3 * * 1" },
  { label: "Weekly on Sunday 1:00 AM", value: "0 1 * * 0" },
  { label: "Custom", value: "custom" },
];

export function ScheduleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [jobType, setJobType] = useState("");
  const [cronPreset, setCronPreset] = useState("");
  const [customCron, setCustomCron] = useState("");

  const cronExpression =
    cronPreset === "custom" ? customCron : cronPreset;

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/jobs/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobType, cronExpression }),
      });
      if (!res.ok) throw new Error("Failed to create schedule");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Schedule created");
      queryClient.invalidateQueries({ queryKey: ["job-schedules"] });
      onOpenChange(false);
      setJobType("");
      setCronPreset("");
      setCustomCron("");
    },
    onError: () => toast.error("Failed to create schedule"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Type</label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((jt) => (
                  <SelectItem key={jt} value={jt}>
                    {JOB_LABELS[jt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Frequency</label>
            <Select value={cronPreset} onValueChange={setCronPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency..." />
              </SelectTrigger>
              <SelectContent>
                {CRON_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {cronPreset === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Cron Expression{" "}
                <span className="text-muted-foreground font-normal">
                  (min hour dom month dow)
                </span>
              </label>
              <Input
                placeholder="0 2 * * *"
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={
              !jobType || !cronExpression || createMutation.isPending
            }
          >
            Create Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
