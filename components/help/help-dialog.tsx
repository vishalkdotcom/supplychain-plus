"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { InfoGraphic } from "./info-graphic";
import { infographicRegistry } from "./content/registry";

interface HelpDialogProps {
  infographicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ infographicId, open, onOpenChange }: HelpDialogProps) {
  const data = infographicRegistry[infographicId];
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {data.domain}
            </Badge>
          </div>
          <DialogTitle className="text-base">{data.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-5">
          <div className="pb-5">
            <InfoGraphic data={data} />
          </div>
        </ScrollArea>
        <DialogFooter showCloseButton className="mt-0" />
      </DialogContent>
    </Dialog>
  );
}
