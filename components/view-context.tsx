"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

type ViewMode = "brand" | "supplier";

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentSupplierId: string | null;
  setCurrentSupplierId: (id: string | null) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  const [viewMode, setViewMode] = useState<ViewMode>("brand");
  const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(
    null
  );

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (pathname === "/" || pathname === "/suppliers") {
      setViewMode("brand");
      setCurrentSupplierId(null);
    } else if (
      pathname?.startsWith("/suppliers/") &&
      pathname !== "/suppliers"
    ) {
      const parts = pathname.split("/");
      const id = parts[2];
      if (id) {
        setViewMode("supplier");
        setCurrentSupplierId(id);
      }
    }
  }

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

