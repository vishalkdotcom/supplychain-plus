"use client";

import { use, useState, useCallback } from "react";
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
  IconArrowRight,
  IconCheck,
  IconClock,
  IconMessage,
  IconRobot,
  IconSchool,
  IconSparkles,
  IconUser,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCase } from "@/lib/api";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: caseData, isLoading } = useQuery({
    queryKey: ["cases", id],
    queryFn: () => fetchCase(id),
  });

  const [aiSummary, setAiSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Sync aiSummary with loaded case data
  const displaySummary = aiSummary || caseData?.aiSummary || "";

  const handleGenerateSummary = useCallback(async () => {
    if (!caseData) return;

    // Guard: don't call AI with empty content
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
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: caseData.id, caseText: content }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSummaryError(data.error || "Failed to generate summary.");
        return;
      }
      if (data.summary) {
        setAiSummary(data.summary);
        // Invalidate the case query so the cached summary loads on next visit
        queryClient.invalidateQueries({ queryKey: ["cases", id] });
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
      setSummaryError("Network error — could not reach the AI service.");
    } finally {
      setIsLoadingSummary(false);
    }
  }, [caseData, id, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
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
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{caseData.id}</h1>
            <Badge variant={getSeverityVariant(caseData.severity)}>
              {caseData.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline">{caseData.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-muted-foreground">
            {caseData.topic} • {caseData.supplierName}
          </p>
        </div>
        <Link href={`/suppliers/${caseData.supplierId}`}>
          <Button variant="outline">
            View Supplier
            <IconArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Status Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Case Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {statusSteps.map((step, idx) => {
              const isComplete = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                      isComplete
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-indigo-600 text-white"
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
                      className={`w-8 h-0.5 ${
                        isComplete ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {caseData.assignee && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <IconUser className="h-4 w-4" />
              <span>Assigned to: {caseData.assignee}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Case Content */}
        <div className="lg:col-span-2 space-y-4">
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

          {/* AI Summary */}
          <Card className="border-indigo-200 bg-indigo-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconRobot className="h-5 w-5 text-indigo-600" />
                  AI Summary
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={isLoadingSummary}
                >
                  {isLoadingSummary ? "Generating..." : "Refresh Summary"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                </div>
              ) : summaryError ? (
                <p className="text-sm text-red-600">{summaryError}</p>
              ) : (
                <p className="text-sm">{displaySummary}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Guidance Panel */}
        <div className="space-y-4">
          {caseData.aiGuidance && (
            <>
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconSparkles className="h-5 w-5 text-purple-600" />
                    AI Guidance
                  </CardTitle>
                  <CardDescription>
                    Recommended steps for this case
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Recommended Steps */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recommended Steps
                    </span>
                    <ol className="space-y-2">
                      {caseData.aiGuidance.recommendedSteps.map((step, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-xs font-medium shrink-0">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Resolution Time */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/80">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Est. resolution:{" "}
                      <strong>
                        {caseData.aiGuidance.estimatedResolutionDays} days
                      </strong>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Draft Response */}
              {caseData.aiGuidance.draftResponse && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Draft Response</CardTitle>
                    <CardDescription>
                      Suggested reply to send to the worker
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic">
                      &quot;{caseData.aiGuidance.draftResponse}&quot;
                    </p>
                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          caseData.aiGuidance!.draftResponse || "",
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? "✓ Copied to Clipboard" : "Use This Response"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Related Training */}
              {caseData.aiGuidance.relatedTraining &&
                caseData.aiGuidance.relatedTraining.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <IconSchool className="h-5 w-5" />
                        Related Training
                      </CardTitle>
                      <CardDescription>
                        Courses to deploy for this issue type
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {caseData.aiGuidance.relatedTraining.map((training) => (
                        <div
                          key={training}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <span className="text-sm">{training}</span>
                          <Link
                            href={`/educate?topic=${encodeURIComponent(training)}`}
                          >
                            <Button size="sm" variant="ghost">
                              Deploy
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
