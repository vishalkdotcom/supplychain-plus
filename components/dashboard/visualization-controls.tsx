"use client";

import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconMinus,
  IconRefresh,
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";

interface VisualizationControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function VisualizationControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleFullscreen,
  isFullscreen,
}: VisualizationControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <div className="flex flex-col bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none border-b border-slate-100"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <IconPlus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <IconMinus className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm"
        onClick={onReset}
        title="Reset View"
      >
        <IconRefresh className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm"
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <IconMinimize className="h-4 w-4" />
        ) : (
          <IconMaximize className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
