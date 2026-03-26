"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SentimentDonutProps {
  positive: number;
  negative: number;
  neutral: number;
}

const COLOR_MAP: Record<string, string> = {
  Positive: "#10b981",
  Neutral: "#6b7280",
  Negative: "#ef4444",
};

export function SentimentDonut({ positive, negative, neutral }: SentimentDonutProps) {
  const data = [
    { name: "Positive", value: positive || 0 },
    { name: "Neutral", value: neutral || 0 },
    { name: "Negative", value: negative || 0 },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-3">
      <div className="w-[80px] h-[80px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={36}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLOR_MAP[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value ?? 0} (${Math.round((Number(value ?? 0) / total) * 100)}%)`,
                name ?? "",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLOR_MAP[d.name] }}
            />
            <span>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
