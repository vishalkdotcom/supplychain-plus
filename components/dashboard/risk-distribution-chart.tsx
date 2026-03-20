"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { getScoreHex } from "@/lib/risk-utils";
import type { Supplier } from "@/types";

const BUCKETS = [
  { min: 0, max: 10, label: "0–10" },
  { min: 11, max: 20, label: "11–20" },
  { min: 21, max: 30, label: "21–30" },
  { min: 31, max: 40, label: "31–40" },
  { min: 41, max: 50, label: "41–50" },
  { min: 51, max: 60, label: "51–60" },
  { min: 61, max: 70, label: "61–70" },
  { min: 71, max: 80, label: "71–80" },
  { min: 81, max: 90, label: "81–90" },
  { min: 91, max: 100, label: "91–100" },
] as const;

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { label: string; count: number } }>;
}) {
  if (!active || !payload?.[0]) return null;
  const { label, count } = payload[0].payload;
  return (
    <div
      className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md"
      style={{ border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
    >
      <p className="font-medium">Risk Score {label}</p>
      <p className="text-muted-foreground">
        {count} supplier{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function RiskDistributionChart({
  suppliers,
}: {
  suppliers: Supplier[];
}) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of BUCKETS) counts.set(b.label, 0);

    for (const s of suppliers) {
      const score = s.riskScore ?? 0;
      for (const b of BUCKETS) {
        if (score >= b.min && score <= b.max) {
          counts.set(b.label, (counts.get(b.label) ?? 0) + 1);
          break;
        }
      }
    }

    return BUCKETS.map((b) => ({
      label: b.label,
      count: counts.get(b.label) ?? 0,
      midpoint: (b.min + b.max) / 2,
    }));
  }, [suppliers]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Risk Distribution</CardTitle>
        <CardDescription>
          Supplier count by risk score range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220} minWidth={0}>
          <BarChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, Math.ceil(maxCount * 1.1)]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={getScoreHex(entry.midpoint)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
