"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { fetchPayslipAnomalies, toggleAnomalyResolved } from "@/lib/api";
import { PayslipAnomaly } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/search-input";
import { getSeverityVariant } from "@/lib/risk-utils";
import { IconAlertTriangle, IconArrowRight } from "@tabler/icons-react";

function formatAge(dateStr: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    BDT: "৳",
    VND: "₫",
    KHR: "៛",
    MMK: "K",
    IDR: "Rp",
    THB: "฿",
    PHP: "₱",
    INR: "₹",
    CNY: "¥",
    PKR: "₨",
    NPR: "₨",
    LKR: "₨",
    ETB: "Br",
    KES: "KSh",
    MXN: "$",
    TRY: "₺",
  };
  return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
}

function getAnomalyTypeLabel(
  anomalyType: PayslipAnomaly["anomalyType"]
): string {
  switch (anomalyType) {
    case "below_minimum":
      return "Below Minimum";
    case "sudden_drop":
      return "Sudden Drop";
    case "inconsistency":
      return "Inconsistency";
  }
}

export default function PayslipAnomaliesPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    severity: parseAsString.withDefault("all"),
    anomalyType: parseAsString.withDefault("all"),
    isResolved: parseAsString.withDefault("all"),
  });

  const perPage = 10;

  const { data, isLoading } = useQuery({
    queryKey: [
      "payslip-anomalies",
      params.page,
      params.search,
      params.severity,
      params.anomalyType,
      params.isResolved,
    ],
    queryFn: () =>
      fetchPayslipAnomalies({
        page: params.page,
        perPage,
        search: params.search,
        severity: params.severity === "all" ? undefined : params.severity,
        anomalyType:
          params.anomalyType === "all" ? undefined : params.anomalyType,
        isResolved:
          params.isResolved === "all"
            ? undefined
            : params.isResolved,
      }),
    placeholderData: keepPreviousData,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isResolved }: { id: number; isResolved: boolean }) =>
      toggleAnomalyResolved(id, isResolved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payslip-anomalies"] });
    },
  });

  const anomalies = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const total = data?.total || 0;

  const unresolvedCount = anomalies.filter((a) => !a.isResolved).length;
  const criticalCount = anomalies.filter(
    (a) => a.severity === "critical" && !a.isResolved
  ).length;
  const belowMinCount = anomalies.filter(
    (a) => a.anomalyType === "below_minimum" && !a.isResolved
  ).length;
  const suddenDropCount = anomalies.filter(
    (a) => a.anomalyType === "sudden_drop" && !a.isResolved
  ).length;

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
            <BreadcrumbPage>Wage Anomaly Detection</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Wage Anomaly Detection
        </h1>
        <p className="text-muted-foreground">
          Payslip irregularities flagged by AI
        </p>
      </div>

      {/* Summary Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Unresolved</CardDescription>
              <CardTitle className="text-3xl">{unresolvedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical</CardDescription>
              <CardTitle className="text-3xl text-destructive">
                {criticalCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Below Minimum</CardDescription>
              <CardTitle className="text-3xl">{belowMinCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sudden Drops</CardDescription>
              <CardTitle className="text-3xl">{suddenDropCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <Select
          value={params.anomalyType}
          onValueChange={(val) => setParams({ anomalyType: val, page: 1 })}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="below_minimum">Below Minimum</SelectItem>
            <SelectItem value="sudden_drop">Sudden Drop</SelectItem>
            <SelectItem value="inconsistency">Inconsistency</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.severity}
          onValueChange={(val) => setParams({ severity: val, page: 1 })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.isResolved}
          onValueChange={(val) => setParams({ isResolved: val, page: 1 })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="false">Unresolved</SelectItem>
            <SelectItem value="true">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <SearchInput placeholder="Search anomalies..." />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : anomalies.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center space-y-2">
              <IconAlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                No anomalies match your filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payslip Anomalies</CardTitle>
            <CardDescription>
              Showing {anomalies.length} of {total} anomalies
              {totalPages > 1 && ` · Page ${params.page} of ${totalPages}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Expected vs Actual</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>AI Interpretation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies.map((anomaly) => (
                    <TableRow key={anomaly.id}>
                      <TableCell>
                        <Link
                          href={`/suppliers/${anomaly.supplierId}`}
                          className="font-medium hover:underline text-primary"
                        >
                          {anomaly.supplierName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getAnomalyTypeLabel(anomaly.anomalyType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="flex items-center gap-1 text-sm">
                          <span>
                            {formatCurrency(
                              anomaly.details.expected,
                              anomaly.details.currency
                            )}
                          </span>
                          <IconArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-destructive">
                            {formatCurrency(
                              anomaly.details.actual,
                              anomaly.details.currency
                            )}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>{anomaly.details.employeeCount}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-muted-foreground line-clamp-1 cursor-default">
                              {anomaly.aiInterpretation}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-xs text-xs"
                          >
                            {anomaly.aiInterpretation}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={anomaly.isResolved}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({
                              id: anomaly.id,
                              isResolved: checked === true,
                            })
                          }
                          disabled={toggleMutation.isPending}
                          aria-label={
                            anomaly.isResolved
                              ? "Mark as unresolved"
                              : "Mark as resolved"
                          }
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatAge(anomaly.detectedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </CardContent>
        </Card>
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
