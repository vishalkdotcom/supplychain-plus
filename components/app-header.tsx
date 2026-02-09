"use client";

import { ViewToggle } from "@/components/view-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
      </div>
      <ViewToggle />
    </header>
  );
}
