"use client";

import { MetricCards } from "@/components/dashboard/metric-cards";
import { RiskHeatmap } from "@/components/dashboard/risk-heatmap";
import { ActivityStream } from "@/components/dashboard/activity-stream";
import {
  MOCK_METRICS,
  MOCK_ACTIVITY_STREAM,
  MOCK_RISK_HEATMAP,
} from "@/lib/mock-data";

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Add date range picker or download button here later */}
        </div>
      </div>

      <MetricCards metrics={MOCK_METRICS} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RiskHeatmap data={MOCK_RISK_HEATMAP} />
        <ActivityStream activities={MOCK_ACTIVITY_STREAM} />
      </div>
    </div>
  );
}
