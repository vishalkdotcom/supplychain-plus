"use client";

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
} from "recharts";
import { getScoreHex } from "@/lib/risk-utils";

interface HeatmapItem {
  id: number;
  name: string;
  score: number;
  region: string;
}

export function RiskHeatmap({ data }: { data: readonly HeatmapItem[] }) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Factory Risk Overview</CardTitle>
        <CardDescription>
          Real-time risk scoring based on cases, surveys, and training data.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={[...data]}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ borderRadius: "8px" }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {[...data].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getScoreHex(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
