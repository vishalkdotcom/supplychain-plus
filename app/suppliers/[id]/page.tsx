"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSupplierById,
  getCasesBySupplier,
  getSurveysBySupplier,
  getTimelineBySupplier,
  getRecommendationsBySupplier,
  MOCK_SUPPLIER_TRAINING,
  MOCK_COURSES,
} from "@/lib/mock-suppliers";
import { SupplierHero } from "@/components/suppliers/supplier-hero";
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

interface SupplierDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SupplierDetailPage({
  params,
}: SupplierDetailPageProps) {
  const { id } = use(params);
  const supplier = getSupplierById(id);

  if (!supplier) {
    notFound();
  }

  const cases = getCasesBySupplier(id);
  const surveys = getSurveysBySupplier(id);
  const timeline = getTimelineBySupplier(id);
  const recommendations = getRecommendationsBySupplier(id);

  // Get training data for this supplier
  const supplierTraining = MOCK_SUPPLIER_TRAINING.filter(
    (t) => t.supplierId === id,
  ).map((t) => {
    const course = MOCK_COURSES.find((c) => c.id === t.courseId);
    return {
      ...t,
      courseName: course?.title || "Unknown Course",
    };
  });

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
      {recommendations.length > 0 && (
        <AIRecommendations recommendations={recommendations} />
      )}

      {/* Cross-Module Panel */}
      <CrossModulePanel
        cases={cases}
        surveys={surveys}
        training={supplierTraining}
      />

      {/* Timeline */}
      {timeline.length > 0 && <SupplierTimeline events={timeline} />}
    </div>
  );
}
