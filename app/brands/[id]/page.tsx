"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchBrands, fetchSuppliers, fetchMetrics } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuilding,
  IconBuildingSkyscraper,
  IconMessage,
  IconSchool,
} from "@tabler/icons-react";
import { getScoreBadgeClasses } from "@/lib/risk-utils";

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params.id as string;

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => fetchBrands(),
  });

  const brand = brands?.find((b: { id: string }) => b.id === brandId);

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

      {/* Supplier List */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <IconBuilding className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium group-hover:text-indigo-600 transition-colors">
                    {supplier.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getScoreBadgeClasses(supplier.riskScore)}`}
                  >
                    {supplier.riskScore}
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
          {suppliers.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              No suppliers found for this brand.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
