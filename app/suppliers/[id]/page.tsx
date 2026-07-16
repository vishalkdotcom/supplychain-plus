"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { HelpButton } from "@/components/help";
import { RiskBreakdown } from "@/components/suppliers/risk-breakdown";
import { CrossModulePanel } from "@/components/suppliers/cross-module-panel";
import { SupplierTimeline } from "@/components/suppliers/supplier-timeline";
import { AIRecommendations } from "@/components/suppliers/ai-recommendations";
import dynamic from "next/dynamic";

const RiskTrendChart = dynamic(
  () => import("@/components/suppliers/risk-trend-chart").then(m => ({ default: m.RiskTrendChart })),
  { ssr: false, loading: () => <div className="h-[400px] w-full rounded-lg bg-muted animate-pulse" /> },
);
const EngagementHealthScore = dynamic(
  () => import("@/components/suppliers/engagement-health-score").then(m => ({ default: m.EngagementHealthScore })),
  { ssr: false, loading: () => <div className="h-[400px] w-full rounded-lg bg-muted animate-pulse" /> },
);
const ForecastBreakdownCard = dynamic(
  () => import("@/components/suppliers/forecast-breakdown-card").then((m) => ({ default: m.ForecastBreakdownCard })),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded-xl bg-muted" /> }
);
const MLSignalsPanel = dynamic(
  () => import("@/components/suppliers/ml-signals-panel").then((m) => ({ default: m.MLSignalsPanel })),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse rounded-xl bg-muted" /> }
);
const RemediationTracker = dynamic(
  () => import("@/components/suppliers/remediation-tracker").then((m) => ({ default: m.RemediationTracker })),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded-xl bg-muted" /> }
);
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
import { IconFileText, IconWand, IconLoader2, IconDownload, IconListCheck, IconBrain, IconUsers, IconTimeline } from "@tabler/icons-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { fetchSupplier, fetchSupplierHistory, fetchCases, fetchSurveys, fetchRecommendations, fetchTimeline, fetchTraining, fetchBrands } from "@/lib/api";
import { isDemoMode } from "@/lib/demo-mode/profile";
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
  const demoMode = isDemoMode();
  
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
    enabled: !demoMode,
  });

  const { data: allSurveysRes } = useQuery({
    queryKey: ["surveys", id],
    queryFn: () => fetchSurveys({ supplierId: id }),
    enabled: !demoMode,
  });

  const { data: recommendations } = useQuery<AIRecommendation[]>({
    queryKey: ["recommendations", id],
    queryFn: () => fetchRecommendations(id),
  });

  const { data: timeline } = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => fetchTimeline(id),
    enabled: !demoMode,
  });

  const { data: training } = useQuery({
    queryKey: ["training", id],
    queryFn: () => fetchTraining(id),
    enabled: !demoMode,
  });

  const { data: riskHistory } = useQuery({
    queryKey: ["supplier-history", id],
    queryFn: () => fetchSupplierHistory(id),
  });

  // Fetch brands to resolve parent company name for breadcrumb
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => fetchBrands(),
    enabled: !!supplier?.parentCompanyId,
  });

  const parentBrand = supplier?.parentCompanyId
    ? brands?.find((b) => b.id === supplier.parentCompanyId)
    : undefined;

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

  // Filter cases and surveys for this supplier — must be declared before handleExportPDF
  const cases =
    allCasesRes?.data?.filter((c: Case) => c.supplierId === id) || [];
  const surveys =
    allSurveysRes?.data?.filter((s: Survey) => s.supplierId === id) || [];
  const supplierRecommendations = recommendations || [];
  const timelineEvents = timeline || [];

  const handleGenerateNarrative = async () => {
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
            referenceId: c.id,
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

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/suppliers">Suppliers</BreadcrumbLink>
            </BreadcrumbItem>
            {parentBrand && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/brands/${parentBrand.id}`}>
                    {parentBrand.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
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
        <HelpButton infographicId="inf-15" />
      </div>

      {/* Hero */}
      <SupplierHero supplier={supplier} parentBrand={parentBrand} />

      {/* Risk Cards Matrix */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RiskTrendChart supplierId={supplier.id} />
        </div>
        <div className="h-full">
          <RiskBreakdown supplier={supplier} previousRiskScore={riskHistory && riskHistory.length >= 2 ? riskHistory[riskHistory.length - 2].riskScore : undefined} />
        </div>
      </div>
      
      {/* Detail Sections — tabbed for progressive disclosure */}
      <Tabs defaultValue="intelligence">
        <TabsList variant="line">
          <TabsTrigger value="intelligence" className="gap-1.5">
            <IconBrain className="w-4 h-4" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="remediation" className="gap-1.5">
            <IconListCheck className="w-4 h-4" />
            Remediation
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5">
            <IconUsers className="w-4 h-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <IconTimeline className="w-4 h-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence" className="space-y-6">
          <ForecastBreakdownCard supplierId={supplier.id} />
          <MLSignalsPanel supplierId={supplier.id} />
        </TabsContent>

        <TabsContent value="remediation">
          <RemediationTracker supplierId={supplier.id} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <EngagementHealthScore supplier={supplier} />
            </div>
            <div className="lg:col-span-2">
              {supplierRecommendations.length > 0 && (
                <AIRecommendations recommendations={supplierRecommendations} />
              )}
            </div>
          </div>
          <CrossModulePanel
            cases={cases}
            surveys={surveys}
            training={training || []}
          />
        </TabsContent>

        <TabsContent value="timeline">
          {timelineEvents.length > 0 ? (
            <SupplierTimeline events={timelineEvents} />
          ) : (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No timeline events yet.
            </p>
          )}
        </TabsContent>
      </Tabs>

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
