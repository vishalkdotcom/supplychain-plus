"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchActivities } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconSparkles,
  IconMessage,
  IconChartBar,
  IconSchool,
  IconArrowRight,
} from "@tabler/icons-react";
import { getModuleColors } from "@/lib/risk-utils";

export function AICopilotFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <IconSparkles className="h-5 w-5 text-primary" />
          AI Co-Pilot
        </CardTitle>
        <CardDescription>Automated actions and cross-module insights</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="px-4 pb-4">
              {/* Cross-Module Insight Highlight */}
              <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <IconSparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Cross-Module Insight
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  Suppliers with high case volume also show declining survey sentiment — consider
                  deploying targeted training to address root causes.
                </p>
              </div>

              <Separator className="mb-3" />

              {/* Activity Items */}
              <div className="space-y-3">
                {activities?.map((activity) => {
                  const href =
                    activity.linkedType === "supplier" && activity.supplierId
                      ? `/suppliers/${activity.supplierId}`
                      : activity.linkedType === "case" && activity.linkedId
                        ? `/connect/${activity.linkedId}`
                        : null;

                  const ModuleIcon =
                    activity.module === "connect"
                      ? IconMessage
                      : activity.module === "engage"
                        ? IconChartBar
                        : activity.module === "educate"
                          ? IconSchool
                          : IconSparkles;

                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div
                        className={`p-1.5 rounded-full shrink-0 ${getModuleColors(activity.module)}`}
                      >
                        <ModuleIcon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {activity.details}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {activity.module}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {activity.time}
                            </span>
                          </div>
                          {href && (
                            <Link href={href}>
                              <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                                Review
                                <IconArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
