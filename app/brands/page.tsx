"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { HelpButton } from "@/components/help";
import { fetchBrands } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { BrandCard } from "@/components/brands/brand-card";

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
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">Brands <HelpButton infographicId="inf-16" /></h1>
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
            <BrandCard brand={brand} />
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
