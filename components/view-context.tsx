"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ViewMode = "brand" | "supplier";

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentSupplierId: string | null;
  setCurrentSupplierId: (id: string | null) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("brand");
  const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(
    null
  );

  return (
    <ViewContext.Provider
      value={{ viewMode, setViewMode, currentSupplierId, setCurrentSupplierId }}
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
