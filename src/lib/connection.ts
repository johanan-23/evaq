import { publicEnv } from "@/config/env";
import { useSettingsStore } from "@/stores/useSettingsStore";

export function resolveApiBaseUrl() {
  const fromSettings = useSettingsStore.getState().apiBaseUrl.trim();
  return (fromSettings || publicEnv.apiBaseUrl).replace(/\/$/, "");
}

export function resolveCameraStreamUrl() {
  const fromSettings = useSettingsStore.getState().cameraStreamUrl.trim();
  return fromSettings || publicEnv.cameraStreamUrl;
}

export function resolveWsUrl() {
  const fromSettings = useSettingsStore.getState().wsUrl.trim();
  return fromSettings || publicEnv.wsUrl;
}

export function hostLabel(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname;
  } catch {
    return url;
  }
}

export function describeBackendFailure(url: string, error: unknown) {
  const host = hostLabel(url);
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();

  if (!url) {
    return {
      title: "BACKEND NOT CONFIGURED",
      detail:
        "No API base URL is set. Add NEXT_PUBLIC_API_BASE_URL to .env and restart the dashboard, or enter it in Settings.",
    };
  }

  if (lower.includes("timed out") || lower.includes("abort")) {
    return {
      title: "BACKEND UNREACHABLE",
      detail: `${host} did not respond before the request timed out. The URL is configured, but no inspection API appears to be running there yet.`,
    };
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("load failed") ||
    lower.includes("connection")
  ) {
    return {
      title: "BACKEND UNREACHABLE",
      detail: `No service is listening at ${host}. The API URL is configured, but nothing is running on that port yet. Start the inspection backend, then use Retry or refresh.`,
    };
  }

  if (lower.includes("failed (404)") || message.includes("(404)")) {
    return {
      title: "BACKEND ENDPOINT MISSING",
      detail: `${host} responded, but the expected inspection API routes were not found. The process on that port may not be the inspection backend.`,
    };
  }

  if (/\(\d{3}\)/.test(message)) {
    return {
      title: "BACKEND ERROR",
      detail: `${host} responded with an error (${message}). The service is reachable, but it is not returning valid inspection data.`,
    };
  }

  return {
    title: "BACKEND UNREACHABLE",
    detail: `${host} is configured, but the dashboard could not read inspection data. ${message || "Nothing is responding at this address yet."}`,
  };
}
