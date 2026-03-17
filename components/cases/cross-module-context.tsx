"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchCaseContext } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconMessage,
  IconChartBar,
  IconSchool,
  IconAlertTriangle,
  IconSparkles,
} from "@tabler/icons-react";

interface CrossModuleContextProps {
  caseId: string;
  supplierId: string;
}

export function CrossModuleContext({ caseId, supplierId }: CrossModuleContextProps) {
  const { data: context, isLoading } = useQuery({
    queryKey: ["case-context", caseId],
    queryFn: () => fetchCaseContext(caseId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconSparkles className="h-5 w-5 text-primary" />
            Cross-Module Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!context) return null;

  const hasData =
    context.similarOpenCases.length > 0 ||
    context.relatedSurveyThemes.length > 0 ||
    context.trainingGaps.length > 0;

  if (!hasData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <IconSparkles className="h-5 w-5 text-primary" />
          Cross-Module Context
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["cases"]} className="w-full">
          {/* Other open cases at same supplier */}
          {context.similarOpenCases.length > 0 && (
            <AccordionItem value="cases">
              <AccordionTrigger className="text-sm hover:no-underline py-2">
                <div className="flex items-center gap-2">
                  <IconMessage className="h-4 w-4 text-blue-500" />
                  Other Cases ({context.similarOpenCases.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {context.similarOpenCases.map((c) => (
                    <Link
                      key={c.id}
                      href={`/connect/${c.id}`}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{c.id}</span>
                        <span className="text-xs text-muted-foreground">{c.topic}</span>
                      </div>
                      <Badge
                        variant={c.severity === "high" ? "destructive" : "secondary"}
                        className="text-[10px]"
                      >
                        {c.severity}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Survey themes */}
          {context.relatedSurveyThemes.length > 0 && (
            <AccordionItem value="surveys">
              <AccordionTrigger className="text-sm hover:no-underline py-2">
                <div className="flex items-center gap-2">
                  <IconChartBar className="h-4 w-4 text-purple-500" />
                  Survey Signals ({context.relatedSurveyThemes.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1.5">
                  {context.relatedSurveyThemes.map((theme, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                      {theme}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Training gaps */}
          {context.trainingGaps.length > 0 && (
            <AccordionItem value="training">
              <AccordionTrigger className="text-sm hover:no-underline py-2">
                <div className="flex items-center gap-2">
                  <IconSchool className="h-4 w-4 text-orange-500" />
                  Training Gaps ({context.trainingGaps.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1.5">
                  {context.trainingGaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <IconAlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
