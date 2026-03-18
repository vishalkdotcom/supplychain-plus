"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { fetchClusters } from "@/lib/api";
import { CaseCluster } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  IconChevronDown,
  IconAlertTriangle,
  IconClock,
} from "@tabler/icons-react";
import { getSeverityVariant } from "@/lib/risk-utils";

function formatAge(dateStr: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function ClusterCard({ cluster }: { cluster: CaseCluster }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getSeverityVariant(cluster.severity)}>
                {cluster.severity}
              </Badge>
              <CardTitle className="text-base">{cluster.clusterLabel}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {cluster.caseCount} cases across {cluster.supplierCount} supplier
              {cluster.supplierCount !== 1 ? "s" : ""}
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <IconClock className="h-3 w-3" />
            {formatAge(cluster.detectedAt)}
          </span>
        </div>

        {/* Regions */}
        {cluster.regions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {cluster.regions.map((region) => (
              <Badge key={region} variant="outline" className="text-xs">
                {region}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Summary */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {cluster.aiSummary}
        </p>

        {/* Representative Messages */}
        {cluster.representativeMessages.length > 0 && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Representative Messages
              </p>
              <p className="text-sm italic text-muted-foreground">
                &ldquo;{cluster.representativeMessages[0]}&rdquo;
              </p>
              {cluster.representativeMessages.length > 1 && (
                <>
                  <CollapsibleContent className="space-y-2">
                    {cluster.representativeMessages.slice(1).map((msg, i) => (
                      <p key={i} className="text-sm italic text-muted-foreground">
                        &ldquo;{msg}&rdquo;
                      </p>
                    ))}
                  </CollapsibleContent>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                    >
                      <IconChevronDown
                        className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                      {open
                        ? "Show less"
                        : `Show ${cluster.representativeMessages.length - 1} more`}
                    </Button>
                  </CollapsibleTrigger>
                </>
              )}
            </div>
          </Collapsible>
        )}

        {/* Case Types */}
        {cluster.caseTypes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">Case types:</span>
            {cluster.caseTypes.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ClustersPage() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    severity: parseAsString.withDefault("all"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["clusters", params.page, params.severity],
    queryFn: () =>
      fetchClusters({
        page: params.page,
        perPage: 8,
        severity: params.severity === "all" ? undefined : params.severity,
      }),
    placeholderData: keepPreviousData,
  });

  const clusters = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const total = data?.total || 0;

  const criticalCount = clusters.filter((c) => c.severity === "critical").length;
  const affectedSuppliers = clusters.reduce(
    (sum, c) => sum + c.supplierCount,
    0
  );

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, params.page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

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
            <BreadcrumbPage>Systemic Patterns</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Systemic Patterns</h1>
        <p className="text-muted-foreground">
          AI-detected case clusters across suppliers
        </p>
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-4">
        <Select
          value={params.severity}
          onValueChange={(val) => setParams({ severity: val, page: 1 })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Clusters</CardDescription>
              <CardTitle className="text-3xl">{total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical Patterns</CardDescription>
              <CardTitle className="text-3xl text-destructive">
                {criticalCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Affected Suppliers</CardDescription>
              <CardTitle className="text-3xl">{affectedSuppliers}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Cluster List */}
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : clusters.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center space-y-2">
              <IconAlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                No clusters match your filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clusters.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setParams({ page: Math.max(1, params.page - 1) })
                }
                className={
                  params.page === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {getPageNumbers().map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => setParams({ page: p })}
                  isActive={params.page === p}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setParams({ page: Math.min(totalPages, params.page + 1) })
                }
                className={
                  params.page === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
