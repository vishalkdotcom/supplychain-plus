"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceTopic } from "@/types";

interface TopicListProps {
  topics: VoiceTopic[];
  title: string;
}

export function TopicList({ topics, title }: TopicListProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No topics detected
          </p>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <div
                key={`${topic.name}-${index}`}
                className="flex items-center gap-2 flex-wrap"
              >
                <span className="text-sm font-medium flex-1 min-w-0">
                  {topic.name}
                </span>
                <Badge variant="outline" className="shrink-0">
                  {topic.mentions} mentions
                </Badge>
                {topic.sentiment === "positive" ? (
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-green-600"
                  >
                    positive
                  </Badge>
                ) : topic.sentiment === "negative" ? (
                  <Badge variant="destructive" className="shrink-0">
                    negative
                  </Badge>
                ) : topic.sentiment === "mixed" ? (
                  <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-300">
                    mixed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="shrink-0">
                    neutral
                  </Badge>
                )}
                {topic.delta > 0 ? (
                  <span className="text-sm text-green-500 shrink-0">
                    ↑{topic.delta}
                  </span>
                ) : topic.delta < 0 ? (
                  <span className="text-sm text-red-500 shrink-0">
                    ↓{Math.abs(topic.delta)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground shrink-0">
                    —
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
