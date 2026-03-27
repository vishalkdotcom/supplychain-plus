"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAISettings } from "@/hooks/use-ai-settings";
import { toast } from "sonner";

interface UseTranslationOptions {
  /** Text(s) to translate. */
  texts: string[];
  /** Unique cache key for this translation context (e.g. "case-123"). */
  cacheKey: string;
}

interface TranslationResult {
  translations: string[];
  targetLanguage: string;
  languageName: string;
}

export function useTranslation({ texts, cacheKey }: UseTranslationOptions) {
  const { activeConfig } = useAISettings();
  const [result, setResult] = useState<TranslationResult | null>(null);

  const mutation = useMutation({
    mutationKey: ["translate", cacheKey],
    mutationFn: async (targetLanguage: string) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (activeConfig) {
        headers["x-ai-provider"] = activeConfig.provider;
        if (activeConfig.apiKey) headers["x-ai-api-key"] = activeConfig.apiKey;
        if (activeConfig.model) headers["x-ai-model"] = activeConfig.model;
      }

      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers,
        body: JSON.stringify({ texts, targetLanguage }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Translation failed");
      }

      return res.json() as Promise<TranslationResult>;
    },
    onSuccess: (data) => setResult(data),
    onError: (err: Error) => {
      toast.error(err.message || "Translation failed");
    },
  });

  const translate = useCallback(
    (targetLanguage: string) => mutation.mutate(targetLanguage),
    [mutation],
  );

  const showOriginal = useCallback(() => setResult(null), []);

  return {
    translate,
    translations: result?.translations ?? null,
    isTranslating: mutation.isPending,
    isTranslated: result !== null,
    targetLanguage: result?.targetLanguage ?? null,
    languageName: result?.languageName ?? null,
    showOriginal,
  };
}
