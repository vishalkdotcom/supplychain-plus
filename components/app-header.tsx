"use client";

import { IconHelpCircle } from "@tabler/icons-react";
import { ViewToggle } from "@/components/view-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHelpMode } from "@/hooks/use-help-mode";
import { ModeToggle } from "@/components/mode-toggle";

export function AppHeader() {
  const { helpMode, toggleHelpMode } = useHelpMode();

  return (
    <header className="flex items-center justify-between border-b px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <ModeToggle />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleHelpMode}
              className={
                helpMode
                  ? "text-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50"
                  : ""
              }
            >
              <IconHelpCircle className="size-4" />
              <span className="sr-only">
                {helpMode ? "Hide help guides" : "Show help guides"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {helpMode ? "Hide contextual help" : "Show contextual help"}
          </TooltipContent>
        </Tooltip>
      </div>
      <ViewToggle />
    </header>
  );
}
