"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchAlerts, fetchRemediations, fetchOverdueRemediations } from "@/lib/api";
import type { Alert } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconAlertTriangle,
  IconShieldCheck,
  IconCircleCheck,
  IconClipboardList,
  IconAlertCircle,
  IconInfoCircle,
  IconClock,
} from "@tabler/icons-react";
import { PlanCard } from "@/components/remediation/plan-card";
import { CreatePlanDialog, type RemediationSource } from "@/components/remediation/create-plan-dialog";

function severityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <IconAlertCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <IconAlertTriangle className="h-4 w-4 text-amber-500" />;
    default:
      return <IconInfoCircle className="h-4 w-4 text-blue-500" />;
  }
}

function severityBadgeVariant(severity: string): "destructive" | "default" | "secondary" {
  switch (severity) {
    case "critical":
      return "destructive";
    case "warning":
      return "default";
    default:
      return "secondary";
  }
}

export default function RemediationPage() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: allAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts", "all"],
    queryFn: () => fetchAlerts(false, 100),
  });

  const { data: remediationsData, isLoading: remediationsLoading } = useQuery({
    queryKey: ["remediations", "all"],
    queryFn: () => fetchRemediations({ perPage: 100 }),
  });

  const { data: overduePlans } = useQuery({
    queryKey: ["remediations", "overdue"],
    queryFn: fetchOverdueRemediations,
  });

  // Figure out which alerts already have remediation plans
  const remediations = remediationsData?.data ?? [];
  const linkedAlertIds = new Set(
    remediations.filter((r) => r.sourceType === "alert").map((r) => r.sourceId),
  );

  const alerts = allAlerts ?? [];
  const unresolvedAlerts = alerts.filter((a) => !a.resolvedAt && !linkedAlertIds.has(a.id));
  const activePlans = remediations.filter((r) => r.status !== "closed");
  const closedPlans = remediations.filter((r) => r.status === "closed");

  const avgDaysToClose =
    closedPlans.length > 0
      ? Math.round(
          closedPlans.reduce((sum, p) => {
            const days = Math.max(
              0,
              Math.floor(
                (new Date(p.closedAt!).getTime() - new Date(p.createdAt).getTime()) / 86400000,
              ),
            );
            return sum + days;
          }, 0) / closedPlans.length,
        )
      : 0;

  const isLoading = alertsLoading || remediationsLoading;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Remediation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Remediation Workflow</h1>
        <p className="text-muted-foreground">
          Detect issues, create action plans, and collect evidence of resolution
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{unresolvedAlerts.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <IconClipboardList className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{activePlans.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Close</CardTitle>
            <IconShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{closedPlans.length > 0 ? avgDaysToClose : "—"}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Plans</CardTitle>
            <IconCircleCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{closedPlans.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Plans</CardTitle>
            <IconClock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{overduePlans?.length ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">
            Alerts
            {unresolvedAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0">
                {unresolvedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active Plans ({activePlans.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedPlans.length})</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-3 mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : unresolvedAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <IconShieldCheck className="h-10 w-10 mx-auto mb-2 text-green-500" />
                <p>All alerts have been addressed</p>
              </CardContent>
            </Card>
          ) : (
            unresolvedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/30 transition-colors"
              >
                {severityIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <Badge
                      variant={severityBadgeVariant(alert.severity)}
                      className="text-xs shrink-0"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {alert.supplierName && (
                      <Link
                        href={`/suppliers/${alert.supplierId}`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {alert.supplierName}
                      </Link>
                    )}
                    <span>&middot;</span>
                    <span>{alert.alertType.replace(/_/g, " ")}</span>
                    <span>&middot;</span>
                    <span>
                      {new Date(alert.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {alert.message}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedAlert(alert);
                    setDialogOpen(true);
                  }}
                >
                  Create Plan
                </Button>
              </div>
            ))
          )}
        </TabsContent>

        {/* Active Plans Tab */}
        <TabsContent value="active" className="mt-4">
          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : activePlans.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <IconClipboardList className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p>No active remediation plans</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {activePlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Closed Tab */}
        <TabsContent value="closed" className="mt-4">
          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : closedPlans.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No closed plans yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {closedPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreatePlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        source={selectedAlert ? {
          type: "alert",
          id: selectedAlert.id,
          title: `Remediate: ${selectedAlert.title}`,
          supplierId: selectedAlert.supplierId,
          supplierName: selectedAlert.supplierName ?? undefined,
          context: selectedAlert.message,
        } satisfies RemediationSource : undefined}
      />
    </div>
  );
}
