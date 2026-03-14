"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { RiskBreakdown } from "@/components/suppliers/risk-breakdown";
import { CrossModulePanel } from "@/components/suppliers/cross-module-panel";
import { SupplierTimeline } from "@/components/suppliers/supplier-timeline";
import { AIRecommendations } from "@/components/suppliers/ai-recommendations";
import { RiskTrendChart } from "@/components/suppliers/risk-trend-chart";
import { EngagementHealthScore } from "@/components/suppliers/engagement-health-score";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconFileText, IconWand, IconLoader2, IconDownload, IconListCheck } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { fetchSupplier, fetchCases, fetchSurveys, fetchRecommendations, fetchTimeline, fetchTraining } from "@/lib/api";
import { Case, Survey, AIRecommendation, EvidenceLink } from "@/types";
import { SupplierHero } from "@/components/suppliers/supplier-hero";
import { toast } from "sonner";

interface SupplierDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SupplierDetailPage({
  params,
}: SupplierDetailPageProps) {
  const { id } = use(params);
  
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [regulatoryFramework, setRegulatoryFramework] = useState("csddd");
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [includeEvidence, setIncludeEvidence] = useState(true);

  const { data: supplier, isLoading } = useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => fetchSupplier(id),
  });

  const { data: allCasesRes } = useQuery({
    queryKey: ["cases", id],
    queryFn: () => fetchCases({ supplierId: id }),
  });

  const { data: allSurveysRes } = useQuery({
    queryKey: ["surveys", id],
    queryFn: () => fetchSurveys({ supplier: id }),
  });

  const { data: recommendations } = useQuery<AIRecommendation[]>({
    queryKey: ["recommendations", id],
    queryFn: () => fetchRecommendations(id),
  });

  const { data: timeline } = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => fetchTimeline(id),
  });

  const { data: training } = useQuery({
    queryKey: ["training", id],
    queryFn: () => fetchTraining(id),
  });

  const handleGenerateNarrative = async () => {
    if (!supplier) return;
    
    setIsGeneratingNarrative(true);
    try {
      const res = await fetch("/api/ai/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier, regulatoryFramework }),
      });
      
      if (!res.ok) throw new Error("Failed to generate narrative");
      
      const data = await res.json();
      setNarrative(data.narrative);
      toast.success("Executive summary generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error generating narrative");
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  const handleExportPDF = async () => {
    if (!supplier) return;

    try {
      const { generateHRDDReport } = await import("@/lib/hrdd-export");

      // Build evidence links from available data
      let evidence: EvidenceLink[] | undefined;
      if (includeEvidence) {
        evidence = [];
        // Cases
        for (const c of cases.slice(0, 10)) {
          evidence.push({
            module: "connect",
            referenceId: `CASE-${c.id}`,
            title: c.topic || "Worker Grievance",
            date: c.createdAt,
            relevance: `${c.severity} severity — ${c.status}`,
          });
        }
        // Surveys
        for (const s of surveys.slice(0, 5)) {
          evidence.push({
            module: "engage",
            referenceId: `SURVEY-${s.id}`,
            title: s.title,
            date: s.createdAt,
            relevance: `${s.responses} responses — risk score ${s.riskScore}`,
          });
        }
        // Training
        if (training) {
          for (const t of (training as Array<{ courseId: string; courseName: string; completionRate: number; lastActivityDate: string }>).slice(0, 5)) {
            evidence.push({
              module: "educate",
              referenceId: `COURSE-${t.courseId}`,
              title: t.courseName,
              date: t.lastActivityDate || "",
              relevance: `${t.completionRate}% completion`,
            });
          }
        }
      }

      generateHRDDReport({
        supplier,
        generatedDate: new Date().toLocaleDateString(),
        auditorName: "Current User",
        narrative: narrative || undefined,
        frameworkName: regulatoryFramework === "csddd" ? "EU CSDDD" : "UK Modern Slavery Act",
        evidence,
      });
      toast.success("Report downloaded successfully");
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!supplier) {
    notFound();
  }

  // Filter cases and surveys for this supplier
  const cases =
    allCasesRes?.data?.filter((c: Case) => c.supplierId === id) || [];
  const surveys =
    allSurveysRes?.data?.filter((s: Survey) => s.supplierId === id) || [];
  const supplierRecommendations = recommendations || [];
  const timelineEvents = timeline || [];

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/suppliers">Suppliers</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{supplier.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Button
          variant="outline"
          onClick={() => setIsExportDialogOpen(true)}
        >
          <IconFileText className="w-4 h-4 mr-2" />
          Export HRDD Report
        </Button>
      </div>

      {/* Hero */}
      <SupplierHero supplier={supplier} />

      {/* Risk Cards Matrix */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RiskTrendChart supplierId={supplier.id} />
        </div>
        <div className="h-full">
          <RiskBreakdown supplier={supplier} />
        </div>
      </div>
      
      {/* Engagement Health & Recommendations */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <EngagementHealthScore supplier={supplier} />
        </div>
        <div className="lg:col-span-2">
          {/* AI Recommendations */}
          {supplierRecommendations.length > 0 && (
            <AIRecommendations recommendations={supplierRecommendations} />
          )}
        </div>
      </div>

      {/* Cross-Module Panel */}
      <CrossModulePanel
        cases={cases}
        surveys={surveys}
        training={training || []}
      />

      {/* Timeline */}
      {timelineEvents.length > 0 && (
        <SupplierTimeline events={timelineEvents} />
      )}

      {/* HRDD Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate HRDD Compliance Report</DialogTitle>
            <DialogDescription>
              Create a regulatory compliance report for {supplier.name} containing risk metrics, contributing factors, and AI-narrated executive summaries.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Regulatory Framework</label>
              <Select value={regulatoryFramework} onValueChange={setRegulatoryFramework}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csddd">EU Corporate Sustainability Due Diligence Directive (CSDDD)</SelectItem>
                  <SelectItem value="uk_msa">UK Modern Slavery Act</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <IconWand className="w-4 h-4 text-indigo-500" />
                  AI Executive Summary (Optional)
                </label>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleGenerateNarrative}
                  disabled={isGeneratingNarrative}
                >
                  {isGeneratingNarrative ? (
                    <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    "Generate Summary"
                  )}
                </Button>
              </div>
              
              <Textarea 
                placeholder="Click 'Generate Summary' to automatically write an executive narrative based on the supplier's real-time risk data and the selected regulatory framework. You can also type your own summary here."
                className="min-h-[200px] leading-relaxed resize-y"
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <Checkbox
              id="include-evidence"
              checked={includeEvidence}
              onCheckedChange={(v) => setIncludeEvidence(v === true)}
            />
            <label htmlFor="include-evidence" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <IconListCheck className="w-4 h-4 text-green-600" />
              Include Supporting Evidence (cases, surveys, training)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportPDF} className="gap-2">
              <IconDownload className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
