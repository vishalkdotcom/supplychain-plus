"use client";

import { Supplier } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { IconSparkles, IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface EngagementHealthScoreProps {
  supplier: Supplier;
}

export function EngagementHealthScore({ supplier }: EngagementHealthScoreProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["engagement-health", supplier.id],
    queryFn: async () => {
      const res = await fetch(`/api/suppliers/${supplier.id}/engagement-health`);
      if (!res.ok) throw new Error("Failed to fetch health score");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Engagement Health</CardTitle>
          <CardDescription>Genuine engagement vs. checkbox compliance</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[250px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Engagement Health</CardTitle>
          <CardDescription>Genuine engagement vs. checkbox compliance</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[250px] text-sm text-muted-foreground">
          Failed to load engagement health data.
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { subject: "Connect App Posts", A: data.metrics.postInteraction, fullMark: 100 },
    { subject: "Survey Activity", A: data.metrics.surveyParticipation, fullMark: 100 },
    { subject: "Training Completion", A: data.metrics.trainingCompletion, fullMark: 100 },
    { subject: "Resolution Speed", A: data.metrics.caseResolutionScore, fullMark: 100 },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Engagement Health</CardTitle>
            <CardDescription>Genuine engagement vs. checkbox compliance</CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-700">{data.healthScore}</span>
            <span className="text-sm text-muted-foreground">/100</span>
            <div className="flex justify-end mt-1">
              <Badge variant="outline" className={
                data.trend === 'improving' ? 'bg-green-50 text-green-700 border-green-200' :
                data.trend === 'worsening' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-slate-50 text-slate-700 border-slate-200'
              }>
                {data.trend === 'improving' && <IconTrendingUp className="w-3 h-3 mr-1" />}
                {data.trend === 'stable' && <IconMinus className="w-3 h-3 mr-1" />}
                {data.trend === 'worsening' && <IconTrendingDown className="w-3 h-3 mr-1" />}
                {data.trend.charAt(0).toUpperCase() + data.trend.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col pt-4">
        {/* Radar Chart */}
        <div className="w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={false} 
                axisLine={false} 
              />
              <RechartsTooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 formatter={(value: any) => [`${value}%`, 'Score']}
              />
              <Radar
                name="Health Score"
                dataKey="A"
                stroke="#6366f1"
                fill="#818cf8"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight Box */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex gap-3 text-sm text-indigo-900 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
            <IconSparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold block mb-1">AI Health Driver Analysis</span>
              {data.aiExplanation}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
