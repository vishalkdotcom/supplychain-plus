"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSupplierHistory } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RiskTrendChartProps {
  supplierId: string;
}

export function RiskTrendChart({ supplierId }: RiskTrendChartProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["supplierHistory", supplierId],
    queryFn: () => fetchSupplierHistory(supplierId),
  });

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Trend</CardTitle>
          <CardDescription>Historical risk score data</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
          No historical data available yet.
        </CardContent>
      </Card>
    );
  }

  // Format data for Recharts
  const chartData = history.map((entry: { snapshotDate: string; riskScore: number; caseScore: number; surveyScore: number; }) => ({
    date: new Date(entry.snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    riskScore: entry.riskScore,
    caseScore: entry.caseScore,
    surveyScore: entry.surveyScore,
  }));

  // Calculate trend
  const latestScore = chartData[chartData.length - 1].riskScore;
  const firstScore = chartData[0].riskScore;
  const scoreDiff = latestScore - firstScore;
  
  let TrendIcon = IconMinus;
  let trendColor = "text-muted-foreground";
  let trendText = "No change";

  if (scoreDiff > 0) {
    TrendIcon = IconTrendingUp;
    trendColor = "text-red-500";
    trendText = `Increased by ${scoreDiff} pts`;
  } else if (scoreDiff < 0) {
    TrendIcon = IconTrendingDown;
    trendColor = "text-green-500";
    trendText = `Decreased by ${Math.abs(scoreDiff)} pts`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Risk Trend</CardTitle>
          <CardDescription>30-day historical risk trajectory</CardDescription>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor} bg-muted/30 px-2 py-1 rounded-md`}>
          <TrendIcon className="w-4 h-4" />
          <span>{trendText}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full min-h-[250px] mt-4">
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#111827', fontWeight: 500 }}
              />
              <Area 
                type="monotone" 
                dataKey="riskScore" 
                name="Overall Risk"
                stroke="#ef4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRisk)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
