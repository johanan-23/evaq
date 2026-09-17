"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  ExpandIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  ScanIcon,
  CameraIcon,
} from "lucide-react";

export function CameraToolbar({
  fit,
  zoom,
  onFit,
  onZoom,
  onFullscreen,
  onRetry,
  compact = false,
}: {
  fit: "contain" | "cover";
  zoom: number;
  onFit: (fit: "contain" | "cover") => void;
  onZoom: (zoom: number) => void;
  onFullscreen: () => void;
  onRetry: () => void;
  compact?: boolean;
}) {
  const demo = useSettingsStore((s) => s.demoMode);

  return (
    <div className={`flex flex-wrap items-center gap-1 border-t px-2 ${compact ? "py-1" : "py-1.5"}`}>
      <Button size="xs" variant="ghost" onClick={onRetry} aria-label="Retry camera">
        <RefreshCwIcon />
        Retry
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={() => onFit(fit === "contain" ? "cover" : "contain")}
      >
        <ScanIcon />
        {fit === "contain" ? "Fill" : "Fit"}
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => onZoom(Math.max(1, zoom - 0.25))}
        aria-label="Zoom out"
      >
        <MinusIcon />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => onZoom(Math.min(3, zoom + 0.25))}
        aria-label="Zoom in"
      >
        <PlusIcon />
      </Button>
      <Button size="xs" variant="ghost" onClick={onFullscreen}>
        <ExpandIcon />
        Fullscreen
      </Button>
      <Button
        size="xs"
        variant="ghost"
        className="ml-auto"
        disabled={demo}
        onClick={() => {
          void api.captureStill().catch(() => undefined);
        }}
      >
        <CameraIcon />
        Capture
      </Button>
    </div>
  );
}
