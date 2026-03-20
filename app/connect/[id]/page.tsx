"use client";

import { use, useState, useCallback, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  IconArrowRight,
  IconCheck,
  IconMessage,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCase, advanceCaseStatus } from "@/lib/api";
import { useAISettings } from "@/hooks/use-ai-settings";
import { getSeverityVariant } from "@/lib/risk-utils";

import { CaseContextStrip } from "@/components/cases/case-context-strip";
import { AIAnalysisCard } from "@/components/cases/ai-analysis-card";
import { ActionPanel } from "@/components/cases/action-panel";
import { CrossModuleContext } from "@/components/cases/cross-module-context";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

interface PlaybookData {
  caseTypeName: string | null;
  avgResolutionDays: number | null;
  bestResolutionDays: number | null;
  totalResolved: number;
  bestPractices: string[];
  aiSummary: string;
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: caseData, isLoading } = useQuery({
    queryKey: ["cases", id],
    queryFn: () => fetchCase(id),
  });

  const { activeConfig } = useAISettings();

  const [aiSummary, setAiSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);
  const [isAdvancingStatus, setIsAdvancingStatus] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const [draftResponseText, setDraftResponseText] = useState<string>("");
  const [draftLanguage, setDraftLanguage] = useState("English");
  const [draftTone, setDraftTone] = useState("Professional");
  const [isRegeneratingDraft, setIsRegeneratingDraft] = useState(false);

  // Playbook query
  const { data: playbookData, isLoading: isPlaybookLoading } = useQuery<PlaybookData>({
    queryKey: ["playbook", caseData?.caseTypeId],
    queryFn: async () => {
      const res = await fetch(`/api/ai/playbook?caseTypeId=${caseData!.caseTypeId}`);
      if (!res.ok) throw new Error("Failed to fetch playbook");
      return res.json();
    },
    enabled: !!caseData?.caseTypeId,
  });

  // Sync draft response text with AI guidance
  useEffect(() => {
    if (caseData?.aiGuidance?.draftResponse && !draftResponseText) {
      setDraftResponseText(caseData.aiGuidance.draftResponse);
    }
  }, [caseData?.aiGuidance?.draftResponse, draftResponseText]);

  const handleRegenerateDraft = async () => {
    if (!caseData?.fullContent) return;
    setIsRegeneratingDraft(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (activeConfig) {
        headers["x-ai-provider"] = activeConfig.provider;
        headers["x-ai-api-key"] = activeConfig.apiKey;
        headers["x-ai-model"] = activeConfig.model;
      }
      const response = await fetch("/api/ai/draft-response", {
        method: "POST",
        headers,
        body: JSON.stringify({
          caseText: caseData.fullContent,
          language: draftLanguage,
          tone: draftTone,
          currentDraft: draftResponseText,
        }),
      });
      const data = await response.json();
      if (response.ok && data.draftResponse) {
        setDraftResponseText(data.draftResponse);
        toast.success("Draft response regenerated");
      } else {
        toast.error(data.error || "Failed to regenerate response");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error regenerating response");
    } finally {
      setIsRegeneratingDraft(false);
    }
  };

  const displaySummary = aiSummary || caseData?.aiSummary || "";

  // Check if guidance is the hardcoded fallback
  const isDefaultGuidance =
    caseData?.aiGuidance?.recommendedSteps?.length === 2 &&
    caseData.aiGuidance.recommendedSteps[0] === "Review case details" &&
    caseData.aiGuidance.recommendedSteps[1] === "Contact supplier";

  // Auto-generate guidance when it's the default fallback
  useEffect(() => {
    if (!caseData || !isDefaultGuidance || isLoadingGuidance) return;

    const content = caseData.fullContent?.trim();
    if (!content || content === "No content." || content.length < 10) return;

    const generateGuidance = async () => {
      setIsLoadingGuidance(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (activeConfig) {
          headers["x-ai-provider"] = activeConfig.provider;
          headers["x-ai-api-key"] = activeConfig.apiKey;
          headers["x-ai-model"] = activeConfig.model;
        }

        const response = await fetch("/api/ai/guidance", {
          method: "POST",
          headers,
          body: JSON.stringify({
            caseId: caseData.id,
            caseText: content,
            caseType: caseData.topic,
            severity: caseData.severity,
          }),
        });
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ["cases", id] });
        }
      } catch (error) {
        console.error("Failed to auto-generate guidance:", error);
      } finally {
        setIsLoadingGuidance(false);
      }
    };

    generateGuidance();
  }, [caseData?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateSummary = useCallback(async () => {
    if (!caseData) return;

    const content = caseData?.fullContent?.trim();
    if (!content || content === "No content." || content.length < 10) {
      setSummaryError(
        "Cannot generate summary — the case has no worker message content.",
      );
      return;
    }

    setIsLoadingSummary(true);
    setSummaryError("");
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (activeConfig) {
        headers["x-ai-provider"] = activeConfig.provider;
        headers["x-ai-api-key"] = activeConfig.apiKey;
        headers["x-ai-model"] = activeConfig.model;
      }

      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers,
        body: JSON.stringify({ caseId: caseData.id, caseText: content }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSummaryError(data.error || "Failed to generate summary.");
        return;
      }
      if (data.summary) {
        setAiSummary(data.summary);
        queryClient.invalidateQueries({ queryKey: ["cases", id] });
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
      setSummaryError("Network error — could not reach the AI service.");
    } finally {
      setIsLoadingSummary(false);
    }
  }, [activeConfig, caseData, id, queryClient]);

  const handleAdvanceStatus = async () => {
    setIsAdvancingStatus(true);
    try {
      const result = await advanceCaseStatus(id);
      toast.success(`Case advanced to ${result.newStatus.replace("_", " ")}`);
      queryClient.invalidateQueries({ queryKey: ["cases", id] });
      setStatusDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to advance case status");
    } finally {
      setIsAdvancingStatus(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftResponseText);
    } catch {
      // Fallback for non-HTTPS or unfocused contexts
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!caseData) {
    notFound();
  }

  const statusSteps = [
    { key: "new", label: "New" },
    { key: "triage", label: "Triage" },
    { key: "assigned", label: "Assigned" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
    { key: "verified", label: "Verified" },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (s) => s.key === caseData.status,
  );

  const canAdvance = currentStepIndex < statusSteps.length - 1;
  const nextStep = canAdvance ? statusSteps[currentStepIndex + 1] : null;

  return (
    <div className="space-y-6">
      {/* ===== ZONE 1: Header + Context ===== */}

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/connect">Connect</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{caseData.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{caseData.id}</h1>
            <Badge variant={getSeverityVariant(caseData.severity)}>
              {caseData.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline">{caseData.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-muted-foreground">
            {caseData.topic} &bull;{" "}
            <Link
              href={`/suppliers/${caseData.supplierId}`}
              className="hover:underline text-primary"
            >
              {caseData.supplierName}
            </Link>
          </p>
          {/* Context Strip */}
          <CaseContextStrip caseId={caseData.id} supplierId={caseData.supplierId} />
        </div>
        <Link href={`/suppliers/${caseData.supplierId}`}>
          <Button variant="outline">
            View Supplier
            <IconArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Interactive Status Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Case Status</CardTitle>
            {canAdvance && nextStep && (
              <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="default">
                    Advance to {nextStep.label}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Advance Case Status</DialogTitle>
                    <DialogDescription>
                      Move case {caseData.id} from &ldquo;{statusSteps[currentStepIndex].label}&rdquo; to &ldquo;{nextStep.label}&rdquo;?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdvanceStatus} disabled={isAdvancingStatus}>
                      {isAdvancingStatus ? "Advancing..." : "Confirm"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto">
            {statusSteps.map((step, idx) => {
              const isComplete = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                      isComplete
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? <IconCheck className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      isCurrent ? "font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`w-6 h-0.5 ${
                        isComplete ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ===== ZONE 2: Two-Column Understanding + Action ===== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Case Intelligence */}
        <div className="lg:col-span-2 space-y-4">
          {/* Worker Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMessage className="h-5 w-5" />
                Worker Report
              </CardTitle>
              <CardDescription>
                Submitted on {caseData.createdAt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{caseData.fullContent}</p>
            </CardContent>
          </Card>

          {/* AI Analysis (merged Summary + Steps) */}
          <AIAnalysisCard
            caseData={caseData}
            displaySummary={displaySummary}
            isLoadingSummary={isLoadingSummary}
            isLoadingGuidance={isLoadingGuidance}
            summaryError={summaryError}
            onRefreshSummary={handleGenerateSummary}
          />

          {/* Cross-Module Context */}
          <CrossModuleContext caseId={caseData.id} supplierId={caseData.supplierId} />
        </div>

        {/* Right Column: Action Panel (sticky) */}
        <div>
          <ActionPanel
            caseData={caseData}
            draftResponseText={draftResponseText}
            setDraftResponseText={setDraftResponseText}
            draftLanguage={draftLanguage}
            setDraftLanguage={setDraftLanguage}
            draftTone={draftTone}
            setDraftTone={setDraftTone}
            isRegeneratingDraft={isRegeneratingDraft}
            onRegenerateDraft={handleRegenerateDraft}
            copied={copied}
            onCopy={handleCopy}
            playbookData={playbookData}
            isPlaybookLoading={isPlaybookLoading}
            caseTopic={caseData.topic}
          />
        </div>
      </div>

      {/* ===== ZONE 3: Quick Actions Bar ===== */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-2">Quick Actions:</span>
            <Button variant="outline" size="sm" className="text-xs">
              Assign Case
            </Button>
            <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive">
              Escalate
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Link to Case
            </Button>
            <Link href={`/educate?topic=${encodeURIComponent(caseData.topic)}`}>
              <Button variant="outline" size="sm" className="text-xs">
                Deploy Training
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
