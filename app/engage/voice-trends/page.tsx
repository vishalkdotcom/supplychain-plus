"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { HelpButton } from "@/components/help";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates, parseAsString } from "nuqs";
import { fetchVoiceTrends, fetchVoiceTrendSuppliers } from "@/lib/api";
import { VoiceTrend } from "@/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TopicList } from "@/components/engage/topic-list";

const SentimentTrendChart = dynamic(
  () =>
    import("@/components/engage/sentiment-trend-chart").then((m) => ({
      default: m.SentimentTrendChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] animate-pulse rounded-xl bg-muted" />
    ),
  }
);

const ThemesBarChart = dynamic(
  () =>
    import("@/components/engage/themes-bar-chart").then((m) => ({
      default: m.ThemesBarChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] animate-pulse rounded-xl bg-muted" />
    ),
  }
);

function formatMonth(monthStr: string): string {
  const date = new Date(monthStr.slice(0, 7) + "-01");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function VoiceTrendsPage() {
  const [params, setParams] = useQueryStates({
    supplierId: parseAsString.withDefault("all"),
  });

  const { data: suppliers } = useQuery({
    queryKey: ["voice-trend-suppliers"],
    queryFn: fetchVoiceTrendSuppliers,
  });

  const { data: trends, isLoading } = useQuery({
    queryKey: ["voice-trends", params.supplierId],
    queryFn: () =>
      fetchVoiceTrends({
        supplierId:
          params.supplierId === "all" ? undefined : params.supplierId,
      }),
  });

  const chartData = (trends ?? [])
    .slice()
    .reverse()
    .map((entry: VoiceTrend) => ({
      month: formatMonth(entry.month),
      sentimentShift: entry.sentimentShift,
    }));

  // Use most recent month's data for topics
  const latestTrend = trends && trends.length > 0 ? trends[0] : null;
  const emergingTopics = latestTrend?.emergingTopics ?? [];
  const decliningTopics = latestTrend?.decliningTopics ?? [];
  const topThemes = latestTrend?.topThemes ?? [];

  // Global sentiment shift: average over all returned months
  const overallShift =
    trends && trends.length > 0
      ? trends.reduce((sum, t) => sum + t.sentimentShift, 0) / trends.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/engage">Engage</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Voice Trends</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          Worker Voice Analytics
          <HelpButton infographicId="inf-08" />
        </h1>
        <p className="text-muted-foreground">
          Emerging topics and sentiment trends from worker feedback
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.supplierId}
          onValueChange={(val) => setParams({ supplierId: val })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Global" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Global (All Suppliers)</SelectItem>
            {(suppliers ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Global Sentiment Shift Hero */}
      {isLoading ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <Card>
          <CardContent>
            <div className="text-center p-6">
              <p className="text-sm text-muted-foreground mb-1">
                {params.supplierId === "all"
                  ? "Global Sentiment Shift"
                  : "Supplier Sentiment Shift"}
              </p>
              <p
                className={`text-4xl font-bold ${
                  overallShift > 0
                    ? "text-green-500"
                    : overallShift < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {overallShift > 0 ? "+" : ""}
                {overallShift.toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentTrendChart data={chartData} />
        <ThemesBarChart themes={topThemes} />
      </div>

      {/* Topics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopicList topics={emergingTopics} title="Emerging Topics" />
          <TopicList topics={decliningTopics} title="Declining Topics" />
        </div>
      )}
    </div>
  );
}
