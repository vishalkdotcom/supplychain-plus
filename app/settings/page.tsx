"use client";

import { useAISettings, AIProvider } from "@/hooks/use-ai-settings";
import { AIProviderRow } from "@/components/settings/ai-provider-row";
import { IconInfoCircle, IconSettings } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SUPPORTED_PROVIDERS: { id: AIProvider; name: string; url?: string }[] = [
  { id: "openrouter", name: "OpenRouter", url: "https://openrouter.ai/keys" },
  {
    id: "nim",
    name: "NVIDIA NIM",
    url: "https://build.nvidia.com/explore/discover",
  },
  {
    id: "google",
    name: "Google AI Studio",
    url: "https://aistudio.google.com/app/apikey",
  },
  { id: "openai", name: "OpenAI", url: "https://platform.openai.com/api-keys" },
  {
    id: "anthropic",
    name: "Anthropic",
    url: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    url: "https://www.perplexity.ai/settings/api",
  },
  { id: "ollama", name: "Ollama (Local)" },
  { id: "lmstudio", name: "LM Studio (Local)" },
];

export default function SettingsPage() {
  const {
    settings,
    isLoaded,
    setActiveProvider,
    saveProviderConfig,
    deleteProviderConfig,
    clearAllSettings,
  } = useAISettings();

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            AI Integrations
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure API keys and preferred models for WOVO+ intelligent
            features.
          </p>
        </div>

        {Object.keys(settings.providers).length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Clear All Settings
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Clear All AI Configurations?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all stored API keys and model preferences
                  from your browser. WOVO+ AI features will not work until
                  you configure a provider again. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearAllSettings();
                    toast.success("All AI configurations cleared.");
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Alert>
        <IconInfoCircle className="h-4 w-4" />
        <AlertTitle>Stored Locally & Securely</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Your API keys are saved only in your browser and are never stored on
          our servers. They are securely transmitted just-in-time for AI
          requests and immediately discarded after use.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <IconSettings className="w-5 h-5" />
            Providers
          </CardTitle>
          <CardDescription>
            Select a provider to expand its configuration. At least one must be
            active to power WOVO+ features.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {SUPPORTED_PROVIDERS.map((provider) => (
              <AIProviderRow
                key={provider.id}
                provider={provider}
                settings={settings}
                onSetActive={setActiveProvider}
                saveProviderConfig={saveProviderConfig}
                deleteProviderConfig={deleteProviderConfig}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
