"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMetrics,
  fetchSuppliers,
  fetchBrands,
} from "@/lib/api";
import { Supplier } from "@/types";
import { useView } from "@/components/view-context";

import { AIBriefingBar } from "@/components/dashboard/ai-briefing-bar";
import { PipelineFreshnessBar } from "@/components/dashboard/pipeline-freshness-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MLInsightCards } from "@/components/dashboard/ml-insight-cards";
import { NeedsAttentionTabs } from "@/components/dashboard/needs-attention-tabs";
import { AICopilotFeed } from "@/components/dashboard/ai-copilot-feed";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IconAlertTriangle,
  IconHeartRateMonitor,
  IconMessage,
  IconSchool,
  IconMap,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { HelpButton } from "@/components/help";

const GeographicRiskMap = dynamic(
  () =>
    import("@/components/dashboard/geographic-risk-map").then((m) => ({
      default: m.GeographicRiskMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full rounded-lg bg-muted animate-pulse" />
    ),
  },
);
const SupplyChainNetwork = dynamic(
  () =>
    import("@/components/dashboard/supply-chain-network").then((m) => ({
      default: m.SupplyChainNetwork,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full rounded-lg bg-muted animate-pulse" />
    ),
  },
);
const RiskDistributionChart = dynamic(
  () =>
    import("@/components/dashboard/risk-distribution-chart").then((m) => ({
      default: m.RiskDistributionChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full rounded-lg bg-muted animate-pulse" />
    ),
  },
);

export function DashboardView() {
  const { viewMode, currentBrandId } = useView();
  const parentCompanyId = viewMode === "brand" ? currentBrandId : undefined;
  const [vizOpen, setVizOpen] = useState(true);

  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["metrics", parentCompanyId],
    queryFn: () => fetchMetrics(parentCompanyId || undefined),
  });

  const { data: suppliersRes, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ["suppliers", parentCompanyId],
    queryFn: () =>
      fetchSuppliers({ parentCompanyId: parentCompanyId || undefined, perPage: 50 }),
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => fetchBrands(),
    enabled: viewMode === "brand" && !!currentBrandId,
  });

  const currentBrandName = brands?.find((b) => b.id === currentBrandId)?.name;

  const EMPTY_SUPPLIERS: Supplier[] = [];
  const suppliers = suppliersRes?.data || EMPTY_SUPPLIERS;

  if (isMetricsLoading || isSuppliersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics) return null;

  // Compute derived metrics
  const highRiskCount = metrics.highRiskSuppliers;
  const urgentVariant = highRiskCount > 0 ? ("urgent" as const) : ("default" as const);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          WOVO AI Control Center
          <HelpButton infographicId="inf-03" />
        </h1>
        <p className="text-muted-foreground">
          {viewMode === "brand" && currentBrandId
            ? `Viewing suppliers for ${currentBrandName || "selected brand"}`
            : "Cross-module intelligence across your supply chain"}
        </p>
      </div>

      {/* Data freshness indicators */}
      <PipelineFreshnessBar />

      {/* Row 0: AI Briefing Bar */}
      <AIBriefingBar />

      {/* Row 1: Priority Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="High-Risk Suppliers"
          icon={<IconAlertTriangle className="h-4 w-4" />}
          value={highRiskCount}
          subtitle={`of ${metrics.totalSuppliers} total suppliers`}
          variant={urgentVariant}
          trend={highRiskCount > 0 ? "up" : undefined}
          trendIsPositive={false}
        />
        <MetricCard
          title="Urgent Cases"
          icon={<IconMessage className="h-4 w-4" />}
          value={metrics.activeCases}
          subtitle="Active cases across all suppliers"
          variant={metrics.activeCases > 10 ? "urgent" : "default"}
        />
        <MetricCard
          title="Supplier Trends"
          icon={<IconHeartRateMonitor className="h-4 w-4" />}
          value={`${metrics.trendsImproving} / ${metrics.trendsWorsening}`}
          subtitle="Improving vs worsening"
          trend={metrics.trendsImproving > metrics.trendsWorsening ? "up" : "down"}
          trendIsPositive={true}
        />
        <MetricCard
          title="Training Coverage"
          icon={<IconSchool className="h-4 w-4" />}
          value={`${metrics.trainingCompletion}%`}
          subtitle="Average completion rate"
          progress={metrics.trainingCompletion}
        />
      </div>

      {/* Row 1.5: ML Intelligence Signals */}
      <MLInsightCards />

      {/* Row 2: Needs Attention (2/3) + AI Co-Pilot (1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NeedsAttentionTabs />
        </div>
        <div>
          <AICopilotFeed />
        </div>
      </div>

      {/* Row 2.5: Risk Distribution Histogram */}
      <RiskDistributionChart suppliers={suppliers} />

      {/* Row 3: Collapsible Visualizations */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
        <IconMap className="h-4 w-4" />
        <span>Visualizations</span>
        <HelpButton infographicId="inf-18" />
      </div>
      <Collapsible open={vizOpen} onOpenChange={setVizOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm text-muted-foreground hover:text-foreground">
            <span>{vizOpen ? "Hide" : "Show"} visualizations</span>
            {vizOpen ? (
              <IconChevronUp className="h-4 w-4" />
            ) : (
              <IconChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <GeographicRiskMap suppliers={suppliers} />
            </div>
            <div className="col-span-full xl:col-span-1">
              <SupplyChainNetwork suppliers={suppliers} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
