"use client";

import { formatDistanceToNow } from "date-fns";
import type { BriefingAttentionItem } from "@/lib/db/schema";
import {
  IconAlertTriangle,
  IconEye,
  IconTrendingUp,
  IconSparkles,
} from "@tabler/icons-react";

interface IntelligenceBriefingProps {
  attentionItems: BriefingAttentionItem[];
  generatedAt: string;
  onItemClick: (query: string) => void;
  onCapabilityClick: (query: string) => void;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: IconAlertTriangle,
    label: "CRITICAL",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    borderColor: "border-red-200 dark:border-red-500/30",
    hoverBorder: "hover:border-red-400 dark:hover:border-red-500/60",
  },
  watch: {
    icon: IconEye,
    label: "WATCH",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    borderColor: "border-amber-200 dark:border-amber-500/30",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500/60",
  },
  positive: {
    icon: IconTrendingUp,
    label: "POSITIVE",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    borderColor: "border-green-200 dark:border-green-500/30",
    hoverBorder: "hover:border-green-400 dark:hover:border-green-500/60",
  },
} as const;

const CAPABILITIES = [
  { label: "Investigate cases", emoji: "🔍", query: "Help me investigate recent grievance cases" },
  { label: "Analyze risk trends", emoji: "📊", query: "Show me the current risk trend analysis" },
  { label: "Generate HRDD report", emoji: "📝", query: "Generate an HRDD compliance report" },
  { label: "Create training", emoji: "🎓", query: "Help me create a new training course" },
  { label: "Design survey", emoji: "📋", query: "Help me design a worker survey" },
  { label: "Recalculate risks", emoji: "🔄", query: "Recalculate all supplier risk scores" },
];

export function IntelligenceBriefing({
  attentionItems,
  generatedAt,
  onItemClick,
  onCapabilityClick,
}: IntelligenceBriefingProps) {
  return (
    <div className="flex gap-3">
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
        <IconSparkles className="w-4 h-4 text-white" />
      </div>

      {/* Briefing content */}
      <div className="flex-1">
        <div className="rounded-2xl p-6 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-foreground">
              Intelligence Briefing
            </span>
            <span className="text-xs text-muted-foreground bg-white dark:bg-muted rounded-full px-2 py-0.5">
              Updated {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            I&apos;ve been monitoring your supply chain. Here&apos;s what needs your attention:
          </p>

          {/* Attention cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {attentionItems.map((item, i) => {
              const config = SEVERITY_CONFIG[item.severity];
              const Icon = config.icon;
              return (
                <button
                  key={i}
                  onClick={() => onItemClick(item.query)}
                  className={`text-left rounded-xl p-4 ${config.bgColor} border ${config.borderColor} ${config.hoverBorder} transition-all hover:-translate-y-0.5 cursor-pointer`}
                >
                  <div className={`text-[10px] font-bold tracking-wider ${config.color} flex items-center gap-1`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </div>
                  <div className="text-sm text-foreground mt-1.5 font-medium">
                    {item.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.metric}
                    {item.region && ` • ${item.region}`}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                    Investigate →
                  </div>
                </button>
              );
            })}
          </div>

          {/* Capability pills */}
          <div className="flex flex-wrap gap-2">
            {CAPABILITIES.map((cap) => (
              <button
                key={cap.label}
                onClick={() => onCapabilityClick(cap.query)}
                className="rounded-full px-3 py-1.5 text-xs text-muted-foreground bg-white dark:bg-muted border border-border hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer"
              >
                {cap.emoji} {cap.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
