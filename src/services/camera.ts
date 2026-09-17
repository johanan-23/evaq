import { resolveApiBaseUrl, resolveCameraStreamUrl } from "@/lib/connection";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { CameraMode } from "@/types/inspection";

export interface CameraConfig {
  mode: CameraMode;
  streamUrl: string | null;
  latestFrameUrl: string | null;
  proxyEnabled: boolean;
}

function trimSlash(url: string) {
  return url.replace(/\/$/, "");
}

export function getCameraConfig(): CameraConfig {
  const settings = useSettingsStore.getState();
  const stream = resolveCameraStreamUrl();
  const apiBase = resolveApiBaseUrl();
  const mode = settings.cameraMode;
  const proxyEnabled = settings.useCameraProxy;

  if (mode === "OFFLINE" || !stream && mode === "MJPEG_STREAM") {
    return {
      mode: stream ? mode : "OFFLINE",
      streamUrl: stream || null,
      latestFrameUrl: apiBase ? `${trimSlash(apiBase)}/camera/latest` : null,
      proxyEnabled,
    };
  }

  const streamUrl =
    proxyEnabled && stream
      ? `/api/proxy/camera?src=${encodeURIComponent(stream)}`
      : stream || null;

  const latestFrameUrl = apiBase
    ? proxyEnabled
      ? `/api/proxy/frame`
      : `${trimSlash(apiBase)}/camera/latest`
    : null;

  return {
    mode: stream || latestFrameUrl ? mode : "OFFLINE",
    streamUrl,
    latestFrameUrl,
    proxyEnabled,
  };
}

export function describeCameraUrl(url: string | null) {
  if (!url) return "Not configured";
  try {
    const parsed = new URL(url, "http://localhost");
    if (url.startsWith("/api/proxy")) return "Proxied local route";
    return `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}${parsed.pathname}`;
  } catch {
    return url;
  }
}
