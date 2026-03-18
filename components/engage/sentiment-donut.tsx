"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface SentimentDonutProps {
  positive: number;
  negative: number;
  neutral: number;
}

const COLORS = ["#10b981", "#6b7280", "#ef4444"]; // green, gray, red

export function SentimentDonut({ positive, negative, neutral }: SentimentDonutProps) {
  const data = [
    { name: "Positive", value: positive || 0 },
    { name: "Neutral", value: neutral || 0 },
    { name: "Negative", value: negative || 0 },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="w-[60px] h-[60px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={15}
            outerRadius={28}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
