"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconCurrencyDollar, IconNetwork, IconRobot, IconClock } from "@tabler/icons-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchCases } from "@/lib/api";
import { useView } from "@/components/view-context";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { SearchInput } from "@/components/search-input";
import { getSeverityVariant } from "@/lib/risk-utils";
import { formatAge } from "@/lib/format-age";


export default function ConnectPage() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    supplier: parseAsString.withDefault("all"),
    severity: parseAsString.withDefault("all"),
    status: parseAsString.withDefault("all"),
  });

  const perPage = 8;

  const { viewMode, currentSupplierId, currentBrandId } = useView();

  const { data: response, isLoading } = useQuery({
    queryKey: [
      "cases",
      params.page,
      params.search,
      params.supplier,
      params.severity,
      params.status,
      viewMode === "supplier" ? currentSupplierId : "all",
      viewMode === "brand" ? currentBrandId : undefined,
    ],
    queryFn: () =>
      fetchCases({
        page: params.page,
        perPage,
        search: params.search,
        supplier: params.supplier,
        severity: params.severity,
        ...(viewMode === "brand" && currentBrandId
          ? { parentCompanyId: currentBrandId }
          : {}),
        ...(viewMode === "supplier" && currentSupplierId
          ? { supplierId: currentSupplierId }
          : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const cases = response?.data || [];
  const totalPages = response?.totalPages || 0;
  const total = response?.total || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, params.page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Connect Intelligence
        </h1>
        <p className="text-muted-foreground">
          AI-powered case management and triage.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/connect/clusters">
            <IconNetwork className="w-4 h-4 mr-1" />
            Systemic Patterns
          </Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/connect/payslip-anomalies">
            <IconCurrencyDollar className="w-4 h-4 mr-1" />
            Wage Anomalies
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput placeholder="Search cases..." />
        <Select
          value={params.severity}
          onValueChange={(val) => setParams({ severity: val, page: 1 })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={params.status}
          onValueChange={(val) => setParams({ status: val, page: 1 })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {cases.length} of {total} cases
        {totalPages > 1 && ` · Page ${params.page} of ${totalPages}`}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Case Inbox</CardTitle>
          <CardDescription>
            Click any case to view details, AI guidance, and take action.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cases.map((c) => {
            const isHighSeverityOpen =
              c.severity === "high" && (c.status === "new" || c.status === "triage");
            return (
              <Link
                key={c.id}
                href={`/connect/${c.id}`}
                className={`flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group ${
                  isHighSeverityOpen ? "border-l-4 border-l-destructive" : ""
                }`}
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {c.id}
                    </span>
                    <Badge variant={getSeverityVariant(c.severity)}>
                      {c.severity}
                    </Badge>
                    <Badge variant="outline">{c.status.replace("_", " ")}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {c.topic}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      {c.supplierName}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconClock className="h-3 w-3" />
                      {formatAge(c.createdAt, true)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <IconRobot className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {c.aiSummary}
                    </span>
                  </div>
                </div>
                <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-4 mt-1" />
              </Link>
            );
          })}
          {cases.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              No cases match your filters.
            </p>
          )}

          {totalPages > 1 && (
            <div className="pt-4 border-t">
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
                        setParams({
                          page: Math.min(totalPages, params.page + 1),
                        })
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
