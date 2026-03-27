"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRemediation, updateRemediation } from "@/lib/api";
import { useDemoUser } from "@/lib/demo-user-context";
import { AuditLog } from "@/components/remediation/audit-log";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconUser,
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconPencil,
  IconAlertTriangle,
  IconDownload,
  IconPrinter,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type { RemediationStatus } from "@/types";
import { StatusPipeline } from "@/components/remediation/status-pipeline";
import { EvidenceTimeline } from "@/components/remediation/evidence-timeline";
import { AddEvidenceDialog } from "@/components/remediation/add-evidence-dialog";
import { AdvancementSuggestion } from "@/components/remediation/advancement-suggestion";

function daysOpen(createdAt: string, closedAt: string | null): number {
  const end = closedAt ? new Date(closedAt) : new Date();
  return Math.max(0, Math.floor((end.getTime() - new Date(createdAt).getTime()) / 86400000));
}

function sourceLink(sourceType: string, sourceId: number | null): string | null {
  if (!sourceId) return null;
  switch (sourceType) {
    case "alert":
      return `/remediation`;
    case "cluster":
      return `/connect/clusters/${sourceId}`;
    case "anomaly":
      return `/connect/payslip-anomalies`;
    default:
      return null;
  }
}

interface RemediationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RemediationDetailPage({ params }: RemediationDetailPageProps) {
  const { id } = use(params);
  const numericId = parseInt(id);
  const queryClient = useQueryClient();
  const { currentUser } = useDemoUser();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState<"rootCause" | "actionPlan" | "details">("rootCause");
  const [editValue, setEditValue] = useState("");
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);

  // For "details" editing
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");

  const { data: plan, isLoading, error } = useQuery({
    queryKey: ["remediation", numericId],
    queryFn: () => fetchRemediation(numericId),
    enabled: !isNaN(numericId),
  });

  const advanceMutation = useMutation({
    mutationFn: (nextStatus: string) => updateRemediation(numericId, { status: nextStatus as RemediationStatus }, currentUser?.id),
    onSuccess: () => {
      toast.success("Status advanced");
      queryClient.invalidateQueries({ queryKey: ["remediation", numericId] });
      queryClient.invalidateQueries({ queryKey: ["remediation-audit", numericId] });
    },
    onError: () => toast.error("Failed to advance status"),
  });

  const editMutation = useMutation({
    mutationFn: (data: Record<string, string>) => updateRemediation(numericId, data, currentUser?.id),
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["remediation", numericId] });
      queryClient.invalidateQueries({ queryKey: ["remediation-audit", numericId] });
      setEditDialogOpen(false);
    },
    onError: () => toast.error("Failed to update"),
  });

  const [now] = useState(() => new Date());

  if (isNaN(numericId)) return notFound();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!plan || error) return notFound();

  const link = sourceLink(plan.sourceType, plan.sourceId);
  const days = daysOpen(plan.createdAt, plan.closedAt);
  const isOverdue = !!(plan.targetDate && new Date(plan.targetDate) < now && plan.status !== "closed");
  const daysOverdue = isOverdue
    ? Math.floor((now.getTime() - new Date(plan.targetDate!).getTime()) / 86400000)
    : 0;
  const formattedTargetDate = plan.targetDate
    ? new Date(plan.targetDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  function openEditDialog(field: "rootCause" | "actionPlan" | "details") {
    setEditField(field);
    if (field === "details") {
      setEditAssignedTo(plan!.assignedTo ?? "");
      setEditTargetDate(plan!.targetDate ?? "");
    } else {
      setEditValue(plan![field] ?? "");
    }
    setEditDialogOpen(true);
  }

  function handleEditSave() {
    if (editField === "details") {
      editMutation.mutate({
        assignedTo: editAssignedTo || "",
        targetDate: editTargetDate || "",
      });
    } else {
      editMutation.mutate({ [editField]: editValue });
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/remediation">Remediation</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{plan.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{plan.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
              <Link
                href={`/suppliers/${plan.supplierId}`}
                className="hover:underline font-medium text-foreground"
              >
                Supplier {plan.supplierId}
              </Link>
              <Badge variant="outline">{plan.sourceType.replace(/_/g, " ")}</Badge>
              {plan.assignedTo && (
                <span className="flex items-center gap-1">
                  <IconUser className="h-3.5 w-3.5" />
                  {plan.assignedTo}
                </span>
              )}
              {plan.targetDate && (
                <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                  <IconCalendar className="h-3.5 w-3.5" />
                  {isOverdue
                    ? `${daysOverdue} days overdue`
                    : `Target: ${formattedTargetDate}`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <IconClock className="h-3.5 w-3.5" />
                {days} days {plan.closedAt ? "to close" : "open"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={`/api/remediations/${id}/export`} download>
                <IconDownload className="h-4 w-4 mr-1" />
                Export JSON
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={`/remediation/${id}/export`} target="_blank" rel="noopener noreferrer">
                <IconPrinter className="h-4 w-4 mr-1" />
                Print Report
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditDialog("details")}
            >
              <IconPencil className="h-4 w-4 mr-1" />
              Edit Details
            </Button>
          </div>
        </div>
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800 flex items-center gap-2">
          <IconAlertTriangle className="h-4 w-4" />
          <span>This remediation plan is <strong>{daysOverdue} days overdue</strong>. Target date was {formattedTargetDate}.</span>
        </div>
      )}

      {/* Status Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusPipeline
            status={plan.status}
            size="md"
            interactive
            onAdvance={(next) => advanceMutation.mutate(next)}
            isAdvancing={advanceMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Advancement Suggestion */}
      {plan.status !== "closed" && (
        <AdvancementSuggestion
          plan={plan}
          onAdvance={(next) => advanceMutation.mutate(next)}
          isAdvancing={advanceMutation.isPending}
        />
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Root Cause + Action Plan + Source */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Root Cause Analysis</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog("rootCause")}
              >
                <IconPencil className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {plan.rootCause ? (
                <p className="text-sm whitespace-pre-wrap">{plan.rootCause}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No root cause analysis yet. Click edit to add one.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Action Plan</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog("actionPlan")}
              >
                <IconPencil className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {plan.actionPlan ? (
                <p className="text-sm whitespace-pre-wrap">{plan.actionPlan}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No action plan defined yet. Click edit to add one.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Source Context */}
          {link && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Source</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={link}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <IconExternalLink className="h-4 w-4" />
                  View originating {plan.sourceType.replace(/_/g, " ")}
                  {plan.sourceId ? ` #${plan.sourceId}` : ""}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Evidence Timeline + Metadata */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evidence</CardTitle>
              <CardDescription>
                {plan.evidence.length} item{plan.evidence.length !== 1 ? "s" : ""} collected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvidenceTimeline
                evidence={plan.evidence}
                onAddEvidence={() => setEvidenceDialogOpen(true)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {new Date(plan.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>
                  {new Date(plan.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span>{plan.sourceType.replace(/_/g, " ")}</span>
              </div>
              {plan.closedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Closed</span>
                  <span>
                    {new Date(plan.closedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <AuditLog remediationId={numericId} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editField === "rootCause"
                ? "Edit Root Cause"
                : editField === "actionPlan"
                  ? "Edit Action Plan"
                  : "Edit Details"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editField === "details" ? (
              <>
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Input
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    placeholder="Responsible party"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={6}
                placeholder={
                  editField === "rootCause"
                    ? "Describe the root cause..."
                    : "Describe the action plan..."
                }
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editMutation.isPending}>
              {editMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Evidence Dialog */}
      <AddEvidenceDialog
        open={evidenceDialogOpen}
        onOpenChange={setEvidenceDialogOpen}
        remediationId={numericId}
      />
    </div>
  );
}
