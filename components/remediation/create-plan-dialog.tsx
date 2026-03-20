"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createRemediation, resolveAlert } from "@/lib/api";
import type { Alert } from "@/types";

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert?: Alert;
}

export function CreatePlanDialog({
  open,
  onOpenChange,
  alert,
}: CreatePlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Key on alert id to reset form state when switching alerts */}
        <CreatePlanForm
          key={alert?.id ?? "none"}
          alert={alert}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function CreatePlanForm({
  alert,
  onOpenChange,
}: {
  alert?: Alert;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const effectiveTitle = title || (alert ? `Remediate: ${alert.title}` : "");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!alert) throw new Error("No alert selected");
      const plan = await createRemediation({
        supplierId: alert.supplierId,
        title: effectiveTitle,
        sourceType: "alert",
        sourceId: alert.id,
        rootCause: rootCause || undefined,
        actionPlan: actionPlan || undefined,
        assignedTo: assignedTo || undefined,
        targetDate: targetDate || undefined,
      });
      await resolveAlert(alert.id);
      return plan;
    },
    onSuccess: () => {
      toast.success("Remediation plan created");
      queryClient.invalidateQueries({ queryKey: ["remediations"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create plan"),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Remediation Plan</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {alert && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium">From alert: {alert.title}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {alert.supplierName} &middot; {alert.alertType.replace(/_/g, " ")}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={alert ? `Remediate: ${alert.title}` : "Plan title"}
          />
        </div>

        <div className="space-y-2">
          <Label>Root Cause Analysis</Label>
          <Textarea
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            placeholder="Describe the root cause..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Action Plan</Label>
          <Textarea
            value={actionPlan}
            onChange={(e) => setActionPlan(e.target.value)}
            placeholder="Describe the remediation actions..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Responsible party"
            />
          </div>
          <div className="space-y-2">
            <Label>Target Date</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          disabled={!alert || mutation.isPending}
        >
          {mutation.isPending ? "Creating..." : "Create Plan"}
        </Button>
      </DialogFooter>
    </>
  );
}
