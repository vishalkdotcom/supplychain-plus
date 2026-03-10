"use client";

import type { TimelineEvent } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconAlertTriangle,
  IconCheck,
  IconBolt,
  IconBell,
  IconMessage,
  IconChartBar,
  IconSchool,
  IconSettings,
} from "@tabler/icons-react";



interface SupplierTimelineProps {
  events: TimelineEvent[];
}

export function SupplierTimeline({ events }: SupplierTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "problem":
        return (
          <div className="p-2 rounded-full bg-red-100 text-red-600">
            <IconAlertTriangle className="h-4 w-4" />
          </div>
        );
      case "action":
        return (
          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
            <IconBolt className="h-4 w-4" />
          </div>
        );
      case "outcome":
        return (
          <div className="p-2 rounded-full bg-green-100 text-green-600">
            <IconCheck className="h-4 w-4" />
          </div>
        );
      case "alert":
        return (
          <div className="p-2 rounded-full bg-orange-100 text-orange-600">
            <IconBell className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100 text-gray-600">
            <IconSettings className="h-4 w-4" />
          </div>
        );
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "connect":
        return <IconMessage className="h-3 w-3" />;
      case "engage":
        return <IconChartBar className="h-3 w-3" />;
      case "educate":
        return <IconSchool className="h-3 w-3" />;
      default:
        return <IconSettings className="h-3 w-3" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>
          Problem → Action → Outcome journey for this supplier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          {/* Events */}
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className="relative z-10">{getEventIcon(event.type)}</div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                      {event.title}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    {getModuleIcon(event.module)}
                    <span className="capitalize">{event.module}</span>
                    {event.linkedType && (
                      <>
                        <span className="mx-1">•</span>
                        <span>
                          Linked {event.linkedType}: {event.linkedId}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
