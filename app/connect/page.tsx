"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { IconArrowRight, IconRobot, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCases } from "@/lib/api";
import { useView } from "@/components/view-context";

export default function ConnectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Showing 8 cases per page

  const { viewMode, currentSupplierId } = useView();

  const { data: casesData, isLoading } = useQuery({
    queryKey: ["cases", viewMode === "supplier" ? currentSupplierId : "all"],
    queryFn: () =>
      fetchCases(
        viewMode === "supplier" && currentSupplierId
          ? currentSupplierId
          : undefined,
      ),
  });

  const cases = casesData || [];
  const suppliers = [...new Set(cases.map((c) => c.supplierName))];

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.aiSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSupplier =
      supplierFilter === "all" || c.supplierName === supplierFilter;
    const matchesSeverity =
      severityFilter === "all" || c.severity === severityFilter;
    return matchesSearch && matchesSupplier && matchesSeverity;
  });

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "default" as const;
      default:
        return "secondary" as const;
    }
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={supplierFilter}
          onValueChange={(val) => {
            setSupplierFilter(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier} value={supplier}>
                {supplier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={severityFilter}
          onValueChange={(val) => {
            setSeverityFilter(val);
            setCurrentPage(1);
          }}
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
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredCases.length} of {cases.length} cases
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Case Inbox</CardTitle>
          <CardDescription>
            Click any case to view details, AI guidance, and take action.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {paginatedCases.map((c) => (
            <Link
              key={c.id}
              href={`/connect/${c.id}`}
              className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium group-hover:text-indigo-600 transition-colors">
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
                <p className="text-sm text-muted-foreground">
                  {c.supplierName}
                </p>
                <div className="flex items-start gap-2">
                  <IconRobot className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                  <span className="text-sm text-muted-foreground line-clamp-2">
                    {c.aiSummary}
                  </span>
                </div>
              </div>
              <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-4 mt-1" />
            </Link>
          ))}
          {filteredCases.length === 0 && (
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
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
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
