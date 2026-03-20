"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { IconDownload, IconArrowsMaximize } from "@tabler/icons-react";

interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface ChartCardProps {
  title: string;
  chartType?: "bar" | "horizontal-bar";
  data: ChartDataItem[];
  onSave?: () => void;
  onExpand?: () => void;
}

export function ChartCard({ title, data, onSave, onExpand }: ChartCardProps) {
  const defaultColor = "#6366f1";

  return (
    <div className="rounded-xl p-4 bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="flex gap-1.5">
          {onSave && (
            <button
              onClick={onSave}
              className="rounded-md px-2 py-1 text-[10px] text-muted-foreground bg-muted hover:bg-accent transition-colors"
            >
              <IconDownload className="w-3 h-3 inline mr-1" />
              Save
            </button>
          )}
          {onExpand && (
            <button
              onClick={onExpand}
              className="rounded-md px-2 py-1 text-[10px] text-muted-foreground bg-muted hover:bg-accent transition-colors"
            >
              <IconArrowsMaximize className="w-3 h-3 inline mr-1" />
              Expand
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color || defaultColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
