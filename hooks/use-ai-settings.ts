import { useSyncExternalStore } from "react";

export type AIProvider =
  | "openrouter"
  | "nim"
  | "google"
  | "openai"
  | "anthropic"
  | "ollama"
  | "lmstudio"
  | "perplexity";

export interface AIProviderConfig {
  apiKey: string;
  model: string;
}

export interface AISettingsState {
  activeProviderId: AIProvider | null;
  providers: Partial<Record<AIProvider, AIProviderConfig>>;
}

export const RECOMMENDED_MODELS = [
  // OpenRouter Models
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "openrouter",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "openrouter",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "openrouter",
  },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "openrouter" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "openrouter" },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct",
    name: "Qwen 2.5 Coder 32B",
    provider: "openrouter",
  },
  // NVIDIA NIM Models
  {
    id: "meta/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B Instruct",
    provider: "nim",
  },
  {
    id: "deepseek-ai/deepseek-coder-6.7b-instruct",
    name: "DeepSeek Coder 6.7B",
    provider: "nim",
  },
  {
    id: "nvidia/nemotron-4-340b-instruct",
    name: "Nemotron-4 340B",
    provider: "nim",
  },
  // Google Gemini Models
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
  },
  // OpenAI Models
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  // Anthropic Models
  {
    id: "claude-3-5-sonnet-latest",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
  },
  {
    id: "claude-3-5-haiku-latest",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
  },
  // Perplexity Models
  {
    id: "llama-3.1-sonar-large-128k-online",
    name: "Sonar Large Online",
    provider: "perplexity",
  },
  {
    id: "llama-3.1-sonar-small-128k-online",
    name: "Sonar Small Online",
    provider: "perplexity",
  },
  // Local Models (Ollama)
  { id: "llama3.1", name: "Llama 3.1 8B", provider: "ollama" },
  { id: "qwen2.5-coder", name: "Qwen 2.5 Coder", provider: "ollama" },
  { id: "mistral", name: "Mistral", provider: "ollama" },
  // Local Models (LM Studio)
  { id: "local-model", name: "Default Local Model", provider: "lmstudio" },
];

const DEFAULT_SETTINGS: AISettingsState = { activeProviderId: null, providers: {} };
let cachedSettingsStr: string | null = null;
let cachedSettings: AISettingsState = DEFAULT_SETTINGS;

const getSettings = () => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  
  const str = localStorage.getItem("wovo_plus_integrations");
  if (str === cachedSettingsStr) return cachedSettings;
  
  cachedSettingsStr = str;
  if (str) {
    try {
      cachedSettings = JSON.parse(str);
    } catch {
      cachedSettings = DEFAULT_SETTINGS;
    }
  } else {
    cachedSettings = DEFAULT_SETTINGS;
  }
  return cachedSettings;
};

const getServerSettings = () => DEFAULT_SETTINGS;

const subscribe = (listener: () => void) => {
  window.addEventListener("wovo-plus-settings-changed", listener);
  window.addEventListener("storage", (e) => {
    if (e.key === "wovo_plus_integrations") listener();
  });
  return () => {
    window.removeEventListener("wovo-plus-settings-changed", listener);
    window.removeEventListener("storage", listener);
  };
};

const emptySubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

export function useAISettings() {
  const settings = useSyncExternalStore(
    subscribe,
    getSettings,
    getServerSettings,
  );
  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    getTrue,
    getFalse,
  );

  const saveSettings = (newSettings: AISettingsState) => {
    localStorage.setItem("wovo_plus_integrations", JSON.stringify(newSettings));
    // Dispatch custom event to notify other instances of the hook
    window.dispatchEvent(new Event("wovo-plus-settings-changed"));
  };

  const saveProviderConfig = (
    provider: AIProvider,
    config: AIProviderConfig,
  ) => {
    const isFirstProvider = Object.keys(settings.providers).length === 0;
    const newSettings: AISettingsState = {
      ...settings,
      activeProviderId:
        settings.activeProviderId || (isFirstProvider ? provider : null),
      providers: {
        ...settings.providers,
        [provider]: config,
      },
    };
    saveSettings(newSettings);
  };

  const deleteProviderConfig = (provider: AIProvider) => {
    const newProviders = { ...settings.providers };
    delete newProviders[provider];

    let newActiveId = settings.activeProviderId;
    if (newActiveId === provider) {
      // If we deleted the active provider, fall back to another one if it exists
      const remainingProviders = Object.keys(newProviders) as AIProvider[];
      newActiveId =
        remainingProviders.length > 0 ? remainingProviders[0] : null;
    }

    saveSettings({
      activeProviderId: newActiveId,
      providers: newProviders,
    });
  };

  const setActiveProvider = (provider: AIProvider) => {
    if (settings.providers[provider]) {
      saveSettings({
        ...settings,
        activeProviderId: provider,
      });
    }
  };

  const clearAllSettings = () => {
    saveSettings({
      activeProviderId: null,
      providers: {},
    });
  };

  // Helper for the backend hooks that just need the active config
  const activeConfig = settings.activeProviderId
    ? {
        provider: settings.activeProviderId,
        ...settings.providers[settings.activeProviderId]!,
      }
    : null;

  return {
    settings,
    isLoaded,
    activeConfig,
    saveProviderConfig,
    deleteProviderConfig,
    clearAllSettings,
    setActiveProvider,
  };
}
