import { useSyncExternalStore } from "react";

const STORAGE_KEY = "wovo_help_mode";
const EVENT_NAME = "wovo-help-mode-changed";

const getHelpMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
};

const getServerHelpMode = () => false;

const subscribe = (listener: () => void) => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener(EVENT_NAME, listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(EVENT_NAME, listener);
    window.removeEventListener("storage", handleStorage);
  };
};

export function useHelpMode() {
  const helpMode = useSyncExternalStore(subscribe, getHelpMode, getServerHelpMode);

  const toggleHelpMode = () => {
    localStorage.setItem(STORAGE_KEY, String(!helpMode));
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  return { helpMode, toggleHelpMode };
}
