import { create } from "zustand";
import { persist } from "zustand/middleware";
import { publicEnv } from "@/config/env";
import type { CameraMode, SystemMode } from "@/types/inspection";

export type DisplayTheme = "dark" | "light" | "system";

interface SettingsState {
  demoMode: boolean;
  cameraStreamUrl: string;
  apiBaseUrl: string;
  wsUrl: string;
  cameraMode: CameraMode;
  useCameraProxy: boolean;
  compactMode: boolean;
  showAdvanced: boolean;
  debugPanel: boolean;
  theme: DisplayTheme;
  setDemoMode: (value: boolean) => void;
  setCameraStreamUrl: (value: string) => void;
  setApiBaseUrl: (value: string) => void;
  setWsUrl: (value: string) => void;
  setCameraMode: (value: CameraMode) => void;
  setUseCameraProxy: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
  setShowAdvanced: (value: boolean) => void;
  setDebugPanel: (value: boolean) => void;
  setTheme: (value: DisplayTheme) => void;
}

function inferredCameraMode(): CameraMode {
  const mode = publicEnv.cameraMode;
  if (mode === "LATEST_FRAME" || mode === "MJPEG_STREAM" || mode === "OFFLINE") {
    return mode;
  }
  return publicEnv.cameraStreamUrl ? "MJPEG_STREAM" : "OFFLINE";
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      demoMode: publicEnv.demoModeDefault,
      cameraStreamUrl: publicEnv.cameraStreamUrl,
      apiBaseUrl: publicEnv.apiBaseUrl,
      wsUrl: publicEnv.wsUrl,
      cameraMode: inferredCameraMode(),
      useCameraProxy: publicEnv.useCameraProxy,
      compactMode: false,
      showAdvanced: false,
      debugPanel: publicEnv.debugDefault,
      theme: "dark",
      setDemoMode: (demoMode) => set({ demoMode }),
      setCameraStreamUrl: (cameraStreamUrl) => set({ cameraStreamUrl }),
      setApiBaseUrl: (apiBaseUrl) => set({ apiBaseUrl }),
      setWsUrl: (wsUrl) => set({ wsUrl }),
      setCameraMode: (cameraMode) => set({ cameraMode }),
      setUseCameraProxy: (useCameraProxy) => set({ useCameraProxy }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setShowAdvanced: (showAdvanced) => set({ showAdvanced }),
      setDebugPanel: (debugPanel) => set({ debugPanel }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "smart-vision-settings",
      skipHydration: true,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...saved,
          apiBaseUrl: saved.apiBaseUrl?.trim() || current.apiBaseUrl,
          cameraStreamUrl:
            saved.cameraStreamUrl?.trim() || current.cameraStreamUrl,
          wsUrl: saved.wsUrl?.trim() || current.wsUrl,
        };
      },
    }
  )
);

export function getSystemMode(): SystemMode {
  return useSettingsStore.getState().demoMode ? "DEMO" : "LIVE";
}

export function applyEnvFallbacks() {
  useSettingsStore.setState((state) => ({
    apiBaseUrl: state.apiBaseUrl.trim() || publicEnv.apiBaseUrl,
    cameraStreamUrl: state.cameraStreamUrl.trim() || publicEnv.cameraStreamUrl,
    wsUrl: state.wsUrl.trim() || publicEnv.wsUrl,
  }));
}

export async function hydrateSettingsFromEnv() {
  await useSettingsStore.persist.rehydrate();
  applyEnvFallbacks();
  try {
    const response = await fetch("/api/runtime-env", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as {
      apiBaseUrl?: string;
      cameraStreamUrl?: string;
      wsUrl?: string;
      demoMode?: boolean | null;
    };
    useSettingsStore.setState((state) => ({
      apiBaseUrl: state.apiBaseUrl.trim() || String(data.apiBaseUrl ?? "").trim(),
      cameraStreamUrl:
        state.cameraStreamUrl.trim() || String(data.cameraStreamUrl ?? "").trim(),
      wsUrl: state.wsUrl.trim() || String(data.wsUrl ?? "").trim(),
      ...(typeof data.demoMode === "boolean" ? { demoMode: data.demoMode } : {}),
    }));
  } catch {
    // Keep inlined NEXT_PUBLIC_* values if the helper route is unavailable.
  }
}
