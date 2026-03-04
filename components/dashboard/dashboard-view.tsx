"use client";

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
} from "@/lib/api";
import { Supplier } from "@/types";

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

  const suppliers = suppliersRes?.data;

  const { data: recommendations, isLoading: isRecommendationsLoading } =
    useQuery({
      queryKey: ["recommendations"],
      queryFn: fetchRecommendations,
    });

  const highRiskSuppliers =
    suppliers
      ?.filter((s: Supplier) => s.riskLevel === "high")
      .sort((a: Supplier, b: Supplier) => b.riskScore - a.riskScore) || [];
  const topRecommendations = (recommendations || [])
    .filter((r) => r.urgency === "immediate")
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
                      {supplier.workerCount.toLocaleString()} workers
                    </p>
                    {supplier.riskBreakdown.reasons[0] && (
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

          {/* This Week's Priorities */}
          {topRecommendations.length > 0 && (
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconSparkles className="h-5 w-5 text-orange-600" />
                  Immediate Actions Required
                </CardTitle>
                <CardDescription>
                  AI-prioritized actions based on cross-module analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topRecommendations.map((rec) => {
                  const supplier = suppliers?.find(
                    (s: Supplier) => s.id === rec.supplierId,
                  );
                  return (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-orange-200"
                    >
                      <IconAlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{rec.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {supplier?.name} • {rec.category}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
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
