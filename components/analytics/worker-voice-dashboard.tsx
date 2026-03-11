"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  IconMessageCircle,
  IconTrendingUp,
  IconBrain,
  IconMoodSmile,
  IconMoodPuzzled,
  IconMoodSad,
} from "@tabler/icons-react";

interface TimelinePoint {
  month: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface EmergingTopic {
  name: string;
  count: number;
  trend: string;
}

interface ProcessedResponse {
  id: string;
  text: string;
  sentiment: string;
  topics: string[];
}

export function WorkerVoiceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics/worker-voice");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch worker voice analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Card className="h-full min-h-[400px]">
        <CardHeader>
          <CardTitle>Worker Voice Analytics</CardTitle>
          <CardDescription>Loading NLP analysis...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Time Series Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconMessageCircle className="h-5 w-5 text-indigo-600" />
                Sentiment Trends (6 Months)
              </CardTitle>
              <CardDescription>
                AI-classified survey responses over time
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{data.summary.responseCount.toLocaleString()}</span>
              <p className="text-xs text-muted-foreground">Responses Processed</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px]">
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="positive" name="Positive" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="neutral" name="Neutral" stroke="#9CA3AF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="negative" name="Negative" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex gap-3 text-sm text-indigo-900">
            <IconBrain className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Automated Insight</span>
              {data.summary.aiInsight}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emerging Topics & Recent Messages */}
      <div className="space-y-4">
        {/* Emerging Topics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconTrendingUp className="h-4 w-4 text-emerald-600" />
              Emerging Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.emergingTopics.map((topic: EmergingTopic, idx: number) => (
                <div key={idx} className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <span className="text-sm font-medium capitalize">{topic.name}</span>
                  <Badge variant="secondary" className="text-xs bg-white">{topic.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Classifier Feed */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recently Processed</CardTitle>
            <CardDescription className="text-xs">Live NLP classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentResponses?.slice(0, 4).map((r: ProcessedResponse, idx: number) => (
              <div key={idx} className="p-3 border rounded-lg bg-card text-sm space-y-2">
                <p className="line-clamp-2 text-slate-700">{r.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1 flex-wrap">
                    {r.topics.map((t, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] py-0">{t}</Badge>
                    ))}
                  </div>
                  {r.sentiment === "positive" ? (
                    <IconMoodSmile className="w-4 h-4 text-green-500" />
                  ) : r.sentiment === "negative" ? (
                    <IconMoodSad className="w-4 h-4 text-red-500" />
                  ) : (
                    <IconMoodPuzzled className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
