"use client";

import Link from "next/link";
import { AlertsCenter } from "@/components/dashboard/alerts-center";
import { GeographicRiskMap } from "@/components/dashboard/geographic-risk-map";
import { SupplyChainNetwork } from "@/components/dashboard/supply-chain-network";
import { PayslipAnomalyTable } from "@/components/analytics/payslip-anomaly-table";
import { WorkerVoiceDashboard } from "@/components/analytics/worker-voice-dashboard";
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
  IconAlertTriangle,
  IconArrowRight,
  IconBuilding,
  IconChartBar,
  IconMessage,
  IconSchool,
  IconSparkles,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMetrics,
  fetchActivities,
  fetchSuppliers,
  fetchRecommendations,
  fetchHierarchy,
} from "@/lib/api";
import { AIRecommendation, Supplier } from "@/types";
import type { HierarchyRelation } from "@/lib/api";

export function DashboardView() {
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
  });

  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });

  const { data: suppliersRes, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => fetchSuppliers(),
  });

  const EMPTY_SUPPLIERS: Supplier[] = [];
  const suppliers = suppliersRes?.data || EMPTY_SUPPLIERS;

  const { data: recommendations, isLoading: isRecommendationsLoading } =
    useQuery<AIRecommendation[]>({
      queryKey: ["recommendations"],
      queryFn: () => fetchRecommendations(),
    });

  const { data: hierarchy } = useQuery<HierarchyRelation[]>({
    queryKey: ["hierarchy"],
    queryFn: () => fetchHierarchy(),
  });

  const highRiskSuppliers =
    suppliers
      ?.filter((s: Supplier) => s.riskLevel === "high")
      .sort((a: Supplier, b: Supplier) => b.riskScore - a.riskScore) || [];
  const topRecommendations = (recommendations || [])
    .filter((r: AIRecommendation) => r.urgency === "immediate")
    .slice(0, 3);

  if (
    isMetricsLoading ||
    isActivitiesLoading ||
    isSuppliersLoading ||
    isRecommendationsLoading
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            WOVO AI Control Center
          </h1>
          <p className="text-muted-foreground">
            Cross-module intelligence across your supply chain
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Suppliers
            </CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.highRiskSuppliers} high risk
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <IconMessage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCases}</div>
            <p className="text-xs text-muted-foreground">
              Across all suppliers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Training Completion
            </CardTitle>
            <IconSchool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.trainingCompletion}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across suppliers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-green-600">
                <IconTrendingUp className="h-4 w-4" />
                <span className="text-lg font-bold">
                  {metrics.trendsImproving}
                </span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <IconTrendingDown className="h-4 w-4" />
                <span className="text-lg font-bold">
                  {metrics.trendsWorsening}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Improving vs worsening suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Geographic & Network Visualizations */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3 mb-6">
        <GeographicRiskMap suppliers={suppliers} />
        <div className="col-span-full xl:col-span-1">
          <SupplyChainNetwork suppliers={suppliers} hierarchy={hierarchy} />
        </div>
      </div>

      {/* NLP Worker Voice Analytics */}
      <WorkerVoiceDashboard />

      {/* Payslip Anomalies AI Detection */}
      <div className="mt-6 mb-6">
        <PayslipAnomalyTable />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Suppliers Needing Attention */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconAlertTriangle className="h-5 w-5 text-red-500" />
                  Suppliers Needing Attention
                </CardTitle>
                <CardDescription>
                  High risk suppliers requiring immediate focus
                </CardDescription>
              </div>
              <Link href="/suppliers">
                <Button variant="outline" size="sm">
                  View All
                  <IconArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {highRiskSuppliers.slice(0, 4).map((supplier) => (
                <Link
                  key={supplier.id}
                  href={`/suppliers/${supplier.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium group-hover:text-indigo-600 transition-colors">
                        {supplier.name}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {supplier.riskScore}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {supplier.country} •{" "}
                      {(supplier.workerCount || 0).toLocaleString()} workers
                    </p>
                    {supplier.riskBreakdown?.reasons?.[0] && (
                      <p className="text-xs text-red-600 mt-1">
                        {supplier.riskBreakdown.reasons[0].factor}
                      </p>
                    )}
                  </div>
                  <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Proactive Alerts Center */}
          <div className="mt-4">
            <AlertsCenter />
          </div>
        </div>

        {/* AI Activity Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSparkles className="h-5 w-5 text-indigo-500" />
              AI Activity
            </CardTitle>
            <CardDescription>
              Recent automated actions and insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities?.map((activity) => (
              <Link
                key={activity.id}
                href={
                  activity.linkedType === "supplier" && activity.supplierId
                    ? `/suppliers/${activity.supplierId}`
                    : activity.linkedType === "case" && activity.linkedId
                      ? `/connect/${activity.linkedId}`
                      : "#"
                }
                className="flex items-start gap-3 group"
              >
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    activity.module === "connect"
                      ? "bg-blue-100 text-blue-600"
                      : activity.module === "engage"
                        ? "bg-purple-100 text-purple-600"
                        : activity.module === "educate"
                          ? "bg-green-100 text-green-600"
                          : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {activity.module === "connect" ? (
                    <IconMessage className="h-3 w-3" />
                  ) : activity.module === "engage" ? (
                    <IconChartBar className="h-3 w-3" />
                  ) : activity.module === "educate" ? (
                    <IconSchool className="h-3 w-3" />
                  ) : (
                    <IconSparkles className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-indigo-600 transition-colors">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {activity.details}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground capitalize">
                      {activity.module}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
