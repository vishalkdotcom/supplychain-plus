"use client";

import Link from "next/link";
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
import { SupplierCard } from "@/components/suppliers/supplier-card";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchSuppliers } from "@/lib/api";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { SearchInput } from "@/components/search-input";

export default function SuppliersPage() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    region: parseAsString.withDefault("all"),
    riskLevel: parseAsString.withDefault("all"),
  });

  const perPage = 12;

  const { data: response, isLoading } = useQuery({
    queryKey: [
      "suppliers",
      params.page,
      params.search,
      params.region,
      params.riskLevel,
    ],
    queryFn: () =>
      fetchSuppliers({
        page: params.page,
        perPage,
        search: params.search,
        region: params.region,
        riskLevel: params.riskLevel,
      }),
    placeholderData: keepPreviousData,
  });

  const suppliers = response?.data || [];
  const totalPages = response?.totalPages || 0;
  const total = response?.total || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Build visible page numbers (show max 5 around current)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, params.page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
        <p className="text-muted-foreground">
          Monitor risk across your supply chain. Click any supplier to see
          detailed insights.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput placeholder="Search suppliers..." />
        <Select
          value={params.riskLevel}
          onValueChange={(val) => setParams({ riskLevel: val, page: 1 })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Risk Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {suppliers.length} of {total} suppliers
        {totalPages > 1 && ` • Page ${params.page} of ${totalPages}`}
      </p>

      {/* Supplier Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Link key={supplier.id} href={`/suppliers/${supplier.id}`}>
            <SupplierCard supplier={supplier} />
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pt-4">
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
        </div>
      )}

      {/* Empty state */}
      {suppliers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No suppliers match your filters.
          </p>
        </div>
      )}
    </div>
  );
}
