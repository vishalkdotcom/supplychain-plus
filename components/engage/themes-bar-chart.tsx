"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { VoiceTopic } from "@/types";

interface ThemesBarChartProps {
  themes: VoiceTopic[];
}

const SENTIMENT_COLORS: Record<VoiceTopic["sentiment"], string> = {
  positive: "#10b981",
  negative: "#ef4444",
  neutral: "#6b7280",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: VoiceTopic;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const topic = payload[0].payload;
  return (
    <div
      className="rounded-lg border bg-background p-2 shadow-md text-sm"
      style={{ borderRadius: "8px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
    >
      <p className="font-medium">{topic.name}</p>
      <p className="text-muted-foreground">{topic.mentions} mentions</p>
      <p style={{ color: SENTIMENT_COLORS[topic.sentiment] }}>
        {topic.sentiment}
      </p>
    </div>
  );
}

export function ThemesBarChart({ themes }: ThemesBarChartProps) {
  const sorted = [...themes]
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Top Themes by Mentions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full min-h-[250px] mt-4">
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e5e7eb"
              />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={100}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="mentions" radius={[0, 4, 4, 0]}>
                {sorted.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SENTIMENT_COLORS[entry.sentiment]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
