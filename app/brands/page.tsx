"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  IconBuildingSkyscraper,
  IconBuilding,
  IconArrowRight,
  IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";
import { getRiskLevel, getRiskBadgeVariant } from "@/lib/risk-utils";

export default function BrandsPage() {
  const [search, setSearch] = useState("");

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands", search],
    queryFn: () => fetchBrands(search || undefined),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">
            {brands?.length || 0} parent companies across your supply chain
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands?.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.id}`}>
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconBuildingSkyscraper className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span className="truncate group-hover:text-indigo-600 transition-colors">
                    {brand.name}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {brand.country && (
                  <p className="text-sm text-muted-foreground">{brand.country}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <IconBuilding className="h-4 w-4" />
                    <span>{brand.supplierCount} suppliers</span>
                  </div>
                  <Badge
                    variant={getRiskBadgeVariant(getRiskLevel(brand.avgRiskScore))}
                    className="text-xs"
                  >
                    {getRiskLevel(brand.avgRiskScore).toUpperCase()} {brand.avgRiskScore}
                  </Badge>
                </div>
                <div className="flex justify-end">
                  <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {brands?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No brands found. No parent company relationships are configured.
        </div>
      )}
    </div>
  );
}
