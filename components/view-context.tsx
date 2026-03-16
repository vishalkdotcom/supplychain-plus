"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ViewMode = "portfolio" | "brand" | "supplier";

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentBrandId: string | null;
  setCurrentBrandId: (id: string | null) => void;
  currentSupplierId: string | null;
  setCurrentSupplierId: (id: string | null) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("portfolio");
  const [currentBrandId, setCurrentBrandId] = useState<string | null>(null);
  const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(
    null
  );

  return (
    <ViewContext.Provider
      value={{
        viewMode,
        setViewMode,
        currentBrandId,
        setCurrentBrandId,
        currentSupplierId,
        setCurrentSupplierId,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}
