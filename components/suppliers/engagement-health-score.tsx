"use client";

import { Supplier } from "@/types";
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
  Tooltip,
} from "recharts";

interface EngagementHealthScoreProps {
  supplier: Supplier;
}

export function EngagementHealthScore({ supplier }: EngagementHealthScoreProps) {
  // Convert risk scores to "health" scores (100 - risk)
  // We use the existing risk breakdown but invert it so higher is better for a health radar
  const data = [
    {
      subject: "Grievance Mgmt",
      A: 100 - supplier.riskBreakdown.caseScore,
      fullMark: 100,
    },
    {
      subject: "Worker Voice",
      A: 100 - supplier.riskBreakdown.surveyScore,
      fullMark: 100,
    },
    {
      subject: "Training Completion",
      A: 100 - supplier.riskBreakdown.trainingScore,
      fullMark: 100,
    },
    {
      subject: "Proactive Engagement",
      A: 100 - supplier.riskBreakdown.engagementScore,
      fullMark: 100,
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Engagement Health</CardTitle>
        <CardDescription>
          Genuine engagement vs. checkbox compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
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
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
      </CardContent>
    </Card>
  );
}
