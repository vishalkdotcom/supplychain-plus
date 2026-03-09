"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAlerts, markAlertRead } from "@/lib/api";
import { Alert } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconBell,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function AlertsCenter() {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: () => fetchAlerts(true, 10), // Fetch top 10 unread
    refetchInterval: 60000, // Refresh every minute
  });

  const markReadMutation = useMutation({
    mutationFn: (alertId: string) => markAlertRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBell className="w-5 h-5" />
            Proactive Alerts
          </CardTitle>
          <CardDescription>System notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts || [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconBell className="w-5 h-5 text-blue-500" />
              Proactive Alerts
              {activeAlerts.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                  {activeAlerts.length}
                </span>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Automated notifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[300px] w-full">
          {activeAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
              <IconCheck className="w-12 h-12 text-green-200 mb-2" />
              <p className="font-medium text-sm">All caught up!</p>
              <p className="text-xs">No active alerts requiring attention.</p>
            </div>
          ) : (
            <div className="divide-y">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 hover:bg-muted/30 transition-colors flex gap-3 group"
                >
                  <div className="mt-0.5 shrink-0">
                    {alert.severity === "high" ? (
                      <IconAlertCircle className="w-5 h-5 text-red-500" />
                    ) : alert.severity === "medium" ? (
                      <IconAlertCircle className="w-5 h-5 text-orange-500" />
                    ) : (
                      <IconInfoCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/suppliers/${alert.supplierId}`}
                        className="font-medium text-sm hover:underline truncate"
                      >
                        {alert.title}
                      </Link>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => markReadMutation.mutate(alert.id)}
                        disabled={markReadMutation.isPending}
                      >
                        <IconCheck className="w-3 h-3 mr-1" />
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
