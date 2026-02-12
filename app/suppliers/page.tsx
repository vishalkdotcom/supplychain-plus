"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupplierCard } from "@/components/suppliers/supplier-card";
import { useQuery } from "@tanstack/react-query";
import { fetchSuppliers } from "@/lib/api";
import { IconSearch } from "@tabler/icons-react";

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const suppliers = suppliersData || [];
  const regions: string[] = [...new Set(suppliers.map((s) => s.region))];

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion =
      regionFilter === "all" || supplier.region === regionFilter;
    const matchesRisk =
      riskFilter === "all" || supplier.riskLevel === riskFilter;
    return matchesSearch && matchesRegion && matchesRisk;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
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
        Showing {filteredSuppliers.length} of {suppliers.length} suppliers
      </p>

      {/* Supplier Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((supplier) => (
          <Link key={supplier.id} href={`/suppliers/${supplier.id}`}>
            <SupplierCard supplier={supplier} />
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No suppliers match your filters.
          </p>
        </div>
      )}
    </div>
  );
}
