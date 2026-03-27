"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBriefing } from "@/lib/api";
import { IconSparkles } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpButton } from "@/components/help";
import { useEffect, useState } from "react";

const LAST_VISIT_KEY = "wovo_plus_last_visit";

function getLastVisit(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(LAST_VISIT_KEY) || undefined;
}

function setLastVisit() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
}

export function AIBriefingBar() {
  const [since] = useState<string | undefined>(() => getLastVisit());

  useEffect(() => {
    // Update the timestamp after reading it so next visit sees changes
    const timeout = setTimeout(() => setLastVisit(), 2000);
    return () => clearTimeout(timeout);
  }, []);

  const { data: briefing, isLoading } = useQuery({
    queryKey: ["briefing", since],
    queryFn: () => fetchBriefing(since),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <IconSparkles className="h-5 w-5 text-primary" />
          </div>
          <Skeleton className="h-5 w-[400px]" />
        </div>
      </div>
    );
  }

  if (!briefing) return null;

  const hasActivity = briefing.newAlerts > 0 || briefing.escalatedCases > 0 || briefing.newHighRiskSuppliers > 0;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        hasActivity
          ? "bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20"
          : "bg-gradient-to-r from-muted/50 to-muted/30 border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${hasActivity ? "bg-primary/10" : "bg-muted"}`}>
          <IconSparkles className={`h-5 w-5 ${hasActivity ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <p className="text-sm font-medium flex items-center gap-1.5">
          <span className="text-muted-foreground mr-1">AI Briefing —</span>
          {briefing.summary}
          <HelpButton infographicId="inf-17" />
        </p>
      </div>
    </div>
  );
}
