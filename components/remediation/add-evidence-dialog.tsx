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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addRemediationEvidence } from "@/lib/api";

const EVIDENCE_TYPES = [
  { value: "case_resolved", label: "Case Resolved" },
  { value: "survey_improvement", label: "Survey Improvement" },
  { value: "training_completed", label: "Training Completed" },
  { value: "risk_score_drop", label: "Risk Score Drop" },
  { value: "anomaly_resolved", label: "Anomaly Resolved" },
  { value: "manual_note", label: "Manual Note" },
];

interface AddEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remediationId: number;
}

export function AddEvidenceDialog({
  open,
  onOpenChange,
  remediationId,
}: AddEvidenceDialogProps) {
  const queryClient = useQueryClient();
  const [evidenceType, setEvidenceType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const mutation = useMutation({
    mutationFn: () =>
      addRemediationEvidence(remediationId, {
        evidenceType,
        title,
        description: description || undefined,
        date,
      }),
    onSuccess: () => {
      toast.success("Evidence added");
      queryClient.invalidateQueries({ queryKey: ["remediation", remediationId] });
      onOpenChange(false);
      resetForm();
    },
    onError: () => toast.error("Failed to add evidence"),
  });

  function resetForm() {
    setEvidenceType("");
    setTitle("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Evidence</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Evidence Type</Label>
            <Select value={evidenceType} onValueChange={setEvidenceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {EVIDENCE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of evidence"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!evidenceType || !title || !date || mutation.isPending}
          >
            {mutation.isPending ? "Adding..." : "Add Evidence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
