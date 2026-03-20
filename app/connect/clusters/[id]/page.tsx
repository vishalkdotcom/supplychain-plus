"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCluster } from "@/lib/api";
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
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconAlertTriangle,
  IconClock,
  IconExternalLink,
  IconInfoCircle,
} from "@tabler/icons-react";
import { getSeverityVariant } from "@/lib/risk-utils";

function formatAge(dateStr: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

interface ClusterDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClusterDetailPage({ params }: ClusterDetailPageProps) {
  const { id } = use(params);

  const { data: cluster, isLoading } = useQuery({
    queryKey: ["cluster", id],
    queryFn: () => fetchCluster(Number(id)),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!cluster) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/connect">Connect</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/connect/clusters">Systemic Patterns</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{cluster.clusterLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={getSeverityVariant(cluster.severity)} className="text-sm">
              {cluster.severity}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">
              {cluster.clusterLabel}
            </h1>
          </div>
          <span className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
            <IconClock className="h-4 w-4" />
            Detected {formatAge(cluster.detectedAt)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{cluster.caseCount} cases</span>
          <span>{cluster.supplierCount} supplier{cluster.supplierCount !== 1 ? "s" : ""}</span>
          {cluster.regions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {cluster.regions.map((region) => (
                <Badge key={region} variant="outline" className="text-xs">
                  {region}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {cluster.aiSummary}
          </p>
        </CardContent>
      </Card>

      {/* Suggested Actions + Affected Suppliers side by side */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Suggested Actions */}
        {cluster.suggestedActions && cluster.suggestedActions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Suggested Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cluster.suggestedActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  {action.urgency === "immediate" ? (
                    <IconAlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  ) : action.urgency === "soon" ? (
                    <IconClock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <IconInfoCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm">{action.action}</p>
                    <Badge
                      variant={
                        action.urgency === "immediate"
                          ? "destructive"
                          : action.urgency === "soon"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs mt-1"
                    >
                      {action.urgency}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Affected Suppliers */}
        {cluster.suppliers.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Affected Suppliers ({cluster.suppliers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {cluster.suppliers.map((supplier) => (
                  <li key={supplier.id}>
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {supplier.name}
                      <IconExternalLink className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cases Table */}
      {cluster.cases.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Cases in This Cluster ({cluster.cases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cluster.cases.map((c) => (
                  <TableRow key={`${c.caseId}-${c.messageId}`}>
                    <TableCell>
                      <Link
                        href={`/connect/${c.caseId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        CASE-{c.caseId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/suppliers/${c.companyId}`}
                        className="text-primary hover:underline"
                      >
                        {c.companyName}
                      </Link>
                    </TableCell>
                    <TableCell>{c.caseTypeName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.severity === "high"
                            ? "destructive"
                            : c.severity === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {c.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {c.status.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.createdAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Representative Messages */}
      {cluster.representativeMessages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Representative Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cluster.representativeMessages.map((msg, i) => (
              <div
                key={i}
                className="rounded-md border bg-muted/30 p-3"
              >
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{msg}&rdquo;
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Case Types */}
      {cluster.caseTypes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Case types:</span>
          {cluster.caseTypes.map((type) => (
            <Badge key={type} variant="outline">
              {type}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
