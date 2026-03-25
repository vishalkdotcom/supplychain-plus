"use client";

import { useState } from "react";
import { IconQuestionMark } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHelpMode } from "@/hooks/use-help-mode";
import { infographicRegistry } from "./content/registry";
import { HelpDialog } from "./help-dialog";

interface HelpButtonProps {
  infographicId: string;
}

export function HelpButton({ infographicId }: HelpButtonProps) {
  const { helpMode } = useHelpMode();
  const [open, setOpen] = useState(false);

  if (!helpMode) return null;

  const data = infographicRegistry[infographicId];
  if (!data) return null;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6 rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
            onClick={() => setOpen(true)}
          >
            <IconQuestionMark className="size-3.5" />
            <span className="sr-only">Learn about {data.title}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{data.shortDescription}</TooltipContent>
      </Tooltip>
      <HelpDialog
        infographicId={infographicId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
