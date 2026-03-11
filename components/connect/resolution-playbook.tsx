"use client";

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrophy, IconBook2, IconTrendingDown } from "@tabler/icons-react";

interface PlaybookData {
  averageDays: number;
  bestDays: number;
  aiBestPractices: string;
  caseType: string;
}

export function ResolutionPlaybook({ caseType, region }: { caseType?: string; region?: string }) {
  const [data, setData] = useState<PlaybookData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaybook() {
      try {
        const typeParam = caseType ? `?type=${encodeURIComponent(caseType)}` : "";
        const regionParam = region ? `&region=${encodeURIComponent(region)}` : "";
        const res = await fetch(`/api/analytics/resolution-playbook${typeParam}${regionParam}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.playbook);
        }
      } catch (err) {
        console.error("Failed to fetch resolution playbook", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaybook();
  }, [caseType, region]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <IconBook2 className="w-4 h-4" />
            Loading AI Resolution Playbook...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!data) return null;

  // Simple parser to make the text bullet points render somewhat nicely if it's plain text
  const practices = data.aiBestPractices.split("\n").filter(line => line.trim().length > 0);

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <IconBook2 className="w-5 h-5 text-emerald-600" />
          AI Resolution Playbook
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="playbook-stats" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="text-sm font-medium">Historical Performance</span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  <IconTrendingDown className="w-3 h-3 mr-1" />
                  Target: {data.bestDays} Days
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-4 mb-4 mt-2">
                <div className="flex-1 p-3 bg-white rounded-md border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Average Resolution</p>
                  <p className="text-lg font-bold">{data.averageDays} days</p>
                </div>
                <div className="flex-1 p-3 bg-emerald-100/50 rounded-md border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-800 mb-1 flex items-center justify-center gap-1">
                    <IconTrophy className="w-3 h-3" /> Best in Class
                  </p>
                  <p className="text-lg font-bold text-emerald-700">{data.bestDays} days</p>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Top performing strategies for {data.caseType}
                </p>
                <ul className="space-y-2">
                  {practices.map((practice, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span dangerouslySetInnerHTML={{ __html: practice.replace(/^\s*[-*•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
