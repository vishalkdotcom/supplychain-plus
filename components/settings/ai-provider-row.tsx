"use client";

import { useState } from "react";
import {
  AIProvider,
  AISettingsState,
  RECOMMENDED_MODELS,
} from "@/hooks/use-ai-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  IconCheck,
  IconSettings,
  IconExternalLink,
  IconChevronRight,
  IconChevronDown,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIProviderRowProps {
  provider: { id: AIProvider; name: string; url?: string };
  settings: AISettingsState;
  onSetActive: (providerId: AIProvider) => void;
  saveProviderConfig: (
    providerId: AIProvider,
    config: { apiKey: string; model: string },
  ) => void;
}

export function AIProviderRow({
  provider,
  settings,
  onSetActive,
  saveProviderConfig,
}: AIProviderRowProps) {
  const config = settings.providers[provider.id];
  const isActive = settings.activeProviderId === provider.id;
  const isConfigured = !!config;

  const [isExpanded, setIsExpanded] = useState(false);
  const [apiKey, setApiKey] = useState(config?.apiKey || "");
  const [model, setModel] = useState(config?.model || "");
  const [customModel, setCustomModel] = useState("");

  const recommendedModelsList = RECOMMENDED_MODELS.filter(
    (m) => m.provider === provider.id,
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !apiKey.trim() &&
      provider.id !== "ollama" &&
      provider.id !== "lmstudio"
    ) {
      toast.error("API Key is required for this provider.");
      return;
    }

    const finalModel = model || customModel;
    if (!finalModel.trim()) {
      toast.error("Model is required.");
      return;
    }

    saveProviderConfig(provider.id, {
      apiKey: apiKey.trim(),
      model: finalModel.trim(),
    });

    toast.success(`${provider.name} settings saved.`);
    setIsExpanded(false);
  };

  return (
    <div
      className={cn("border-b last:border-0", isExpanded ? "bg-muted/30" : "")}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">
            {isExpanded ? (
              <IconChevronDown className="w-4 h-4" />
            ) : (
              <IconChevronRight className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {provider.name}
              {isActive && (
                <Badge
                  variant="default"
                  className="text-[10px] h-4 px-1.5 bg-green-600/10 text-green-700 hover:bg-green-600/20 border-0"
                >
                  Active
                </Badge>
              )}
            </div>
            {isConfigured && !isExpanded && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Model: {config.model} • Key:{" "}
                {config.apiKey ? `...${config.apiKey.slice(-4)}` : "None"}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {isConfigured && !isActive && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSetActive(provider.id)}
            >
              Set Active
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <IconSettings className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-11 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="space-y-1.5 flex-1">
                <Label
                  htmlFor={`api-key-${provider.id}`}
                  className="text-xs text-muted-foreground uppercase"
                >
                  API Key / Host
                </Label>
                <Input
                  id={`api-key-${provider.id}`}
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    provider.id === "ollama"
                      ? "http://localhost:11434/api..."
                      : provider.id === "lmstudio"
                        ? "http://localhost:1234/v1..."
                        : "sk-..."
                  }
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1.5 flex-1">
                <Label
                  htmlFor={`model-${provider.id}`}
                  className="text-xs text-muted-foreground uppercase"
                >
                  Model ID
                </Label>
                <select
                  id={`model-${provider.id}`}
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    if (e.target.value !== "custom") setCustomModel("");
                  }}
                  className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    Select model...
                  </option>
                  {recommendedModelsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                  <option value="custom">Custom Model</option>
                </select>

                {model === "custom" && (
                  <Input
                    placeholder="Enter explicit string ID..."
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="h-8 mt-2 text-sm"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {provider.url ? (
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  Get API Key <IconExternalLink className="w-3 h-3 ml-1" />
                </a>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
