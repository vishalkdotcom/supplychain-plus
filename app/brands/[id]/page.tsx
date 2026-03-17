"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchBrand, fetchSuppliers, fetchMetrics } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuilding,
  IconBuildingSkyscraper,
  IconMessage,
  IconSchool,
  IconSearch,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { getScoreBadgeClasses, getRiskBadgeVariant } from "@/lib/risk-utils";

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params.id as string;
  const [supplierSearch, setSupplierSearch] = useState("");

  const { data: brand } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: () => fetchBrand(brandId),
    enabled: !!brandId,
  });

  const { data: metrics } = useQuery({
    queryKey: ["metrics", brandId],
    queryFn: () => fetchMetrics(brandId),
    enabled: !!brandId,
  });

  const { data: suppliersRes, isLoading } = useQuery({
    queryKey: ["suppliers", brandId],
    queryFn: () => fetchSuppliers({ parentCompanyId: brandId, perPage: 50 }),
    enabled: !!brandId,
  });

  const suppliers = suppliersRes?.data || [];

  // Client-side filter for supplier search within the brand
  const filteredSuppliers = supplierSearch
    ? suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
          s.country.toLowerCase().includes(supplierSearch.toLowerCase()),
      )
    : suppliers;

  // Risk distribution
  const highRiskCount = suppliers.filter((s) => s.riskScore > 70).length;
  const mediumRiskCount = suppliers.filter(
    (s) => s.riskScore > 30 && s.riskScore <= 70,
  ).length;
  const lowRiskCount = suppliers.filter((s) => s.riskScore <= 30).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/brands">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <IconBuildingSkyscraper className="h-8 w-8 text-indigo-500" />
            {brand?.name || `Brand #${brandId}`}
          </h1>
          <p className="text-muted-foreground">
            {brand?.country && `${brand.country} · `}
            {suppliers.length} suppliers
          </p>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
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
              <CardTitle className="text-sm font-medium">Avg Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge
                  variant="outline"
                  className={getScoreBadgeClasses(brand?.avgRiskScore || 0)}
                >
                  {brand?.avgRiskScore || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <IconMessage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeCases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training</CardTitle>
              <IconSchool className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.trainingCompletion}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Distribution */}
      {suppliers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  {highRiskCount}
                </Badge>
                <span className="text-sm text-muted-foreground">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {mediumRiskCount}
                </Badge>
                <span className="text-sm text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {lowRiskCount}
                </Badge>
                <span className="text-sm text-muted-foreground">Low Risk</span>
              </div>
            </div>
            {/* Visual bar */}
            {suppliers.length > 0 && (
              <div className="flex h-2 rounded-full overflow-hidden mt-3">
                {highRiskCount > 0 && (
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${(highRiskCount / suppliers.length) * 100}%`,
                    }}
                  />
                )}
                {mediumRiskCount > 0 && (
                  <div
                    className="bg-orange-500"
                    style={{
                      width: `${(mediumRiskCount / suppliers.length) * 100}%`,
                    }}
                  />
                )}
                {lowRiskCount > 0 && (
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(lowRiskCount / suppliers.length) * 100}%`,
                    }}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supplier List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Suppliers</CardTitle>
          <div className="relative w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter suppliers..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Sorted by risk score (highest first)
            {supplierSearch &&
              ` · ${filteredSuppliers.length} of ${suppliers.length} shown`}
          </p>
          {filteredSuppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <IconBuilding className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate group-hover:text-indigo-600 transition-colors">
                    {supplier.name}
                  </span>
                  <Badge
                    variant={getRiskBadgeVariant(supplier.riskLevel)}
                    className="text-xs shrink-0"
                  >
                    {supplier.riskLevel.toUpperCase()} {supplier.riskScore}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {supplier.country} ·{" "}
                  {supplier.workerCount.toLocaleString()} workers
                </p>
              </div>
              <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          ))}
          {filteredSuppliers.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              {supplierSearch
                ? "No suppliers match your search."
                : "No suppliers found for this brand."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
