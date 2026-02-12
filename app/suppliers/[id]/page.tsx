"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { RiskBreakdown } from "@/components/suppliers/risk-breakdown";
import { CrossModulePanel } from "@/components/suppliers/cross-module-panel";
import { SupplierTimeline } from "@/components/suppliers/supplier-timeline";
import { AIRecommendations } from "@/components/suppliers/ai-recommendations";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { IconFileText } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchSupplier,
  fetchCases,
  fetchSurveys,
  fetchRecommendations,
  fetchTimeline,
} from "@/lib/api";
import { SupplierHero } from "@/components/suppliers/supplier-hero";

interface SupplierDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SupplierDetailPage({
  params,
}: SupplierDetailPageProps) {
  const { id } = use(params);

  const { data: supplier, isLoading } = useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => fetchSupplier(id),
  });

  const { data: allCases } = useQuery({
    queryKey: ["cases"],
    queryFn: fetchCases,
  });

  const { data: allSurveys } = useQuery({
    queryKey: ["surveys"],
    queryFn: fetchSurveys,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
  });

  const { data: timeline } = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => fetchTimeline(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!supplier) {
    notFound();
  }

  // Filter cases and surveys for this supplier
  const cases = allCases?.filter((c) => c.supplierId === id) || [];
  const surveys = allSurveys?.filter((s) => s.supplierId === id) || [];
  const supplierRecommendations =
    recommendations?.filter((r) => r.supplierId === id) || [];
  const timelineEvents = timeline || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/suppliers">Suppliers</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{supplier.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero + Risk Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                import("@/lib/hrdd-export").then(({ generateHRDDReport }) => {
                  generateHRDDReport({
                    supplier: supplier,
                    generatedDate: new Date().toLocaleDateString(),
                    auditorName: "Current User", // In real app, get from auth context
                  });
                });
              }}
            >
              <IconFileText className="w-4 h-4 mr-2" />
              Export HRDD Report
            </Button>
          </div>
          <SupplierHero supplier={supplier} />
        </div>
        <div>
          <RiskBreakdown supplier={supplier} />
        </div>
      </div>

      {/* AI Recommendations */}
      {supplierRecommendations.length > 0 && (
        <AIRecommendations recommendations={supplierRecommendations} />
      )}

      {/* Cross-Module Panel */}
      <CrossModulePanel cases={cases} surveys={surveys} training={[]} />

      {/* Timeline */}
      {timelineEvents.length > 0 && (
        <SupplierTimeline events={timelineEvents} />
      )}
    </div>
  );
}
