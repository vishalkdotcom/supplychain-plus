"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconLanguage, IconLoader, IconArrowBack } from "@tabler/icons-react";
import { useTranslation } from "@/hooks/use-translation";
import { SUPPORTED_LANGUAGES } from "@/lib/ai/languages";

interface TranslateButtonProps {
  /** Text(s) to translate. */
  texts: string[];
  /** Unique cache key for React Query (e.g. "case-123"). */
  cacheKey: string;
  /** Render translated content. Receives translations array. */
  children: (translations: string[]) => React.ReactNode;
  /** "block" shows translation below; "inline" shows next to original. */
  variant?: "block" | "inline";
  /** Default target language code (default: "vi"). */
  defaultLanguage?: string;
}

const languageEntries = Object.entries(SUPPORTED_LANGUAGES);

export function TranslateButton({
  texts,
  cacheKey,
  children,
  variant = "block",
  defaultLanguage = "vi",
}: TranslateButtonProps) {
  const [targetLang, setTargetLang] = useState(defaultLanguage);
  const {
    translate,
    translations,
    isTranslating,
    isTranslated,
    languageName,
    showOriginal,
  } = useTranslation({ texts, cacheKey });

  return (
    <div className={variant === "block" ? "mt-3" : "inline-flex items-center gap-1.5"}>
      {/* Controls row */}
      <div className="flex items-center gap-1.5">
        {isTranslated ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground"
            onClick={showOriginal}
          >
            <IconArrowBack className="h-3.5 w-3.5" />
            Show Original
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-muted-foreground"
              onClick={() => translate(targetLang)}
              disabled={isTranslating}
            >
              {isTranslating ? (
                <IconLoader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <IconLanguage className="h-3.5 w-3.5" />
              )}
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="h-7 w-[120px] text-xs">
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
        {isTranslated && languageName && (
          <Badge variant="secondary" className="text-[10px] h-5">
            {languageName}
          </Badge>
        )}
      </div>

      {/* Translated content */}
      {isTranslated && translations && (
        <div
          className={
            variant === "block"
              ? "mt-2 border-l-2 border-primary/20 pl-3"
              : ""
          }
        >
          {children(translations)}
        </div>
      )}
    </div>
  );
}
