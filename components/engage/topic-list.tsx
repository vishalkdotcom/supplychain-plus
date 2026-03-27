"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconLanguage, IconLoader, IconArrowBack } from "@tabler/icons-react";
import { VoiceTopic } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import { SUPPORTED_LANGUAGES } from "@/lib/ai/languages";

interface TopicListProps {
  topics: VoiceTopic[];
  title: string;
}

const languageEntries = Object.entries(SUPPORTED_LANGUAGES);

export function TopicList({ topics, title }: TopicListProps) {
  const [targetLang, setTargetLang] = useState("vi");
  const {
    translate,
    translations,
    isTranslating,
    isTranslated,
    languageName,
    showOriginal,
  } = useTranslation({
    texts: topics.map((t) => t.name),
    cacheKey: `topics-${title}`,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          {topics.length > 0 && (
            <div className="flex items-center gap-1.5">
              {isTranslated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1 text-muted-foreground"
                    onClick={showOriginal}
                  >
                    <IconArrowBack className="h-3 w-3" />
                    Original
                  </Button>
                  {languageName && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {languageName}
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1 text-muted-foreground"
                    onClick={() => translate(targetLang)}
                    disabled={isTranslating}
                  >
                    {isTranslating ? (
                      <IconLoader className="h-3 w-3 animate-spin" />
                    ) : (
                      <IconLanguage className="h-3 w-3" />
                    )}
                    {isTranslating ? "Translating..." : "Translate"}
                  </Button>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="h-6 w-[100px] text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageEntries.map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          )}
        </div>
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
                  {isTranslated && translations?.[index] && (
                    <span className="text-muted-foreground font-normal">
                      {" "}({translations[index]})
                    </span>
                  )}
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
