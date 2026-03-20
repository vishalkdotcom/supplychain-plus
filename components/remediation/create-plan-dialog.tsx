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
import { IconSparkles } from "@tabler/icons-react";
import { useDemoUser } from "@/lib/demo-user-context";

export interface RemediationSource {
  type: "alert" | "cluster" | "anomaly" | "monitoring_signal" | "manual";
  id: number | null;
  title: string;
  supplierId: string;
  supplierName?: string;
  context?: string; // Additional context for AI root cause generation
}

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: RemediationSource;
}

export function CreatePlanDialog({
  open,
  onOpenChange,
  source,
}: CreatePlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Key on source id+type to reset form state when switching sources */}
        <CreatePlanForm
          key={source ? `${source.type}-${source.id}` : "none"}
          source={source}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function CreatePlanForm({
  source,
  onOpenChange,
}: {
  source?: RemediationSource;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { currentUser } = useDemoUser();
  const [title, setTitle] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isGenerating, setIsGenerating] = useState<"root_cause" | "action_plan" | null>(null);

  const effectiveTitle = title || (source ? source.title : "");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!source) throw new Error("No source selected");
      const plan = await createRemediation({
        supplierId: source.supplierId,
        title: effectiveTitle,
        sourceType: source.type,
        sourceId: source.id ?? undefined,
        rootCause: rootCause || undefined,
        actionPlan: actionPlan || undefined,
        assignedTo: assignedTo || undefined,
        targetDate: targetDate || undefined,
      }, currentUser?.id);
      // Only resolve alert if source is an alert
      if (source.type === "alert" && source.id) {
        await resolveAlert(source.id);
      }
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

  async function handleAIDraft(mode: "root_cause" | "action_plan") {
    setIsGenerating(mode);
    const setter = mode === "root_cause" ? setRootCause : setActionPlan;
    setter(""); // Clear current

    try {
      const res = await fetch("/api/ai/remediation-root-cause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: source?.type ?? "manual",
          sourceContext: mode === "action_plan" ? rootCause : (source?.context ?? ""),
          supplierInfo: source?.supplierName ?? "",
          mode,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setter(text);
      }
    } catch {
      toast.error("AI generation failed");
    } finally {
      setIsGenerating(null);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Remediation Plan</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {source && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium">{source.title}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {source.supplierName && <>{source.supplierName} &middot; </>}
              {source.type.replace(/_/g, " ")}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={source ? source.title : "Plan title"}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Root Cause Analysis</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAIDraft("root_cause")}
              disabled={!source?.context || isGenerating !== null}
            >
              <IconSparkles className="h-3.5 w-3.5 mr-1" />
              {isGenerating === "root_cause" ? "Generating..." : "AI Draft"}
            </Button>
          </div>
          <Textarea
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            placeholder="Describe the root cause..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Action Plan</Label>
            {rootCause && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAIDraft("action_plan")}
                disabled={isGenerating !== null}
              >
                <IconSparkles className="h-3.5 w-3.5 mr-1" />
                {isGenerating === "action_plan" ? "Generating..." : "AI Draft"}
              </Button>
            )}
          </div>
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
          disabled={!source || mutation.isPending}
        >
          {mutation.isPending ? "Creating..." : "Create Plan"}
        </Button>
      </DialogFooter>
    </>
  );
}
