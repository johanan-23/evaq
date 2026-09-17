"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { CameraViewportSkeleton } from "@/components/common/page-skeletons";
import { CameraOverlay } from "@/components/camera/camera-overlay";
import { CameraToolbar } from "@/components/camera/camera-toolbar";
import { LiveClock } from "@/components/common/live-clock";
import { backendConfig } from "@/config/backend";
import { hostLabel } from "@/lib/connection";
import { describeCameraUrl, getCameraConfig } from "@/services/camera";
import { useInspectionStore } from "@/stores/useInspectionStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { CameraOffIcon } from "lucide-react";

type FeedStatus = "connecting" | "live" | "offline";

export function CameraFeed({
  compact = false,
}: {
  compact?: boolean;
}) {
  const overlays = useInspectionStore((s) => s.currentInspection?.overlays);
  const demo = useInspectionStore((s) => s.systemMode === "DEMO");
  const setCameraStatus = useInspectionStore((s) => s.setCameraStatus);
  const cameraStreamUrl = useSettingsStore((s) => s.cameraStreamUrl);
  const cameraMode = useSettingsStore((s) => s.cameraMode);
  const useProxy = useSettingsStore((s) => s.useCameraProxy);
  const panelRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<"contain" | "cover">("contain");
  const [zoom, setZoom] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>("connecting");
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const config = getCameraConfig();
  const streamKey = `${retryKey}-${cameraStreamUrl}-${cameraMode}-${useProxy}`;

  useEffect(() => {
    setFeedStatus("connecting");
    setCameraStatus("UNKNOWN");
  }, [streamKey, setCameraStatus]);

  useEffect(() => {
    if (config.mode !== "LATEST_FRAME" || !config.latestFrameUrl) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(config.latestFrameUrl!, { cache: "no-store" });
        if (!response.ok) throw new Error("frame");
        const blob = await response.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setFrameUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setFeedStatus("live");
        setCameraStatus("ONLINE");
      } catch {
        if (!cancelled) {
          setFeedStatus("offline");
          setCameraStatus("OFFLINE");
        }
      }
    };
    void poll();
    const id = window.setInterval(poll, backendConfig.latestFramePollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [config.mode, config.latestFrameUrl, retryKey, setCameraStatus]);

  const enterFullscreen = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, []);

  const src = config.mode === "LATEST_FRAME" ? frameUrl : config.streamUrl;
  const configured = Boolean(
    config.mode !== "OFFLINE" &&
      (config.mode === "LATEST_FRAME" ? config.latestFrameUrl : config.streamUrl)
  );
  const panelStatus: FeedStatus =
    !configured || feedStatus === "offline" ? "offline" : feedStatus;
  const live = panelStatus === "live";
  const cameraHost = hostLabel(
    config.streamUrl || config.latestFrameUrl || cameraStreamUrl || ""
  );

  return (
    <div ref={panelRef} className="h-full min-h-0">
    <Card className="h-full gap-0 py-0">
      <CardHeader className={compact ? "border-b py-2" : "border-b py-3"}>
        <CardTitle className="text-xs font-medium tracking-wide uppercase">
          Live Inspection Camera
        </CardTitle>
        <CardAction className="flex items-center gap-2">
          {demo ? <Badge variant="outline">DEMO</Badge> : null}
          <span
            className={`inline-flex items-center gap-1.5 font-data text-[10px] tracking-wide uppercase ${
              live ? "text-status-pass" : "text-muted-foreground"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                live ? "animate-pulse bg-status-pass" : "bg-muted-foreground"
              }`}
            />
            {live ? "Live" : panelStatus === "connecting" ? "Connecting" : "Offline"}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="relative flex min-h-0 flex-1 flex-col p-0">
        <div
          className={`relative overflow-hidden bg-black ${compact ? "h-[220px] lg:h-[240px]" : "min-h-[280px] flex-1"}`}
        >
          {configured && src && panelStatus !== "offline" ? (
            <>
              {/* MJPEG is displayed by the browser via img; do not decode in JS. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={streamKey}
                src={src}
                alt=""
                onLoad={() => {
                  setFeedStatus("live");
                  setCameraStatus("ONLINE");
                }}
                onError={() => {
                  setFeedStatus("offline");
                  setCameraStatus("OFFLINE");
                }}
                className={`h-full w-full ${live ? "opacity-100" : "pointer-events-none opacity-0"} ${fit === "contain" ? "object-contain" : "object-cover"}`}
                style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
              />
              {live ? <CameraOverlay overlays={overlays} /> : null}
              {demo && live ? (
                <span className="absolute top-2 left-2 rounded-md border bg-background/80 px-1.5 py-0.5 font-data text-[10px] uppercase">
                  Demo
                </span>
              ) : null}
            </>
          ) : null}

          {demo && !configured ? (
            <div className={`flex h-full flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_8px,var(--background)_8px,var(--background)_16px)] ${compact ? "min-h-[220px]" : "min-h-[280px]"}`}>
              <Badge variant="outline">DEMO CAMERA</Badge>
              {compact ? null : (
                <p className="px-4 text-center text-sm text-muted-foreground">
                  No stream URL configured. This panel is a placeholder, not a
                  camera image.
                </p>
              )}
            </div>
          ) : null}

          {!demo && panelStatus === "connecting" ? (
            <CameraViewportSkeleton />
          ) : null}

          {!demo && panelStatus === "offline" ? (
            <EmptyState
              className={`h-full rounded-none border-0 bg-transparent ${compact ? "min-h-[220px] px-3 py-4" : "min-h-[200px]"}`}
              icon={CameraOffIcon}
              title="CAMERA OFFLINE"
              description={
                compact
                  ? cameraHost
                    ? `No feed at ${cameraHost}.`
                    : "No camera stream URL is configured."
                  : cameraHost
                    ? `No camera is responding at ${cameraHost}. The stream URL is configured, but nothing is publishing a feed there yet.`
                    : "No camera stream URL is configured."
              }
              action={
                <Button size="sm" variant="outline" onClick={() => setRetryKey((k) => k + 1)}>
                  Retry
                </Button>
              }
            />
          ) : null}
        </div>
        <CameraToolbar
          compact={compact}
          fit={fit}
          zoom={zoom}
          onFit={setFit}
          onZoom={setZoom}
          onFullscreen={enterFullscreen}
          onRetry={() => setRetryKey((k) => k + 1)}
        />
        {compact ? null : (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-[11px] text-muted-foreground">
          <LiveClock className="font-data" />
          <span>Stream: {describeCameraUrl(config.streamUrl)}</span>
          <span className="uppercase">{config.mode.replace("_", " ")}</span>
        </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
