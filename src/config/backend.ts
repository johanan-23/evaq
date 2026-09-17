/**
 * Central place to change guessed or confirmed backend paths.
 * Do not scatter endpoint strings across UI components.
 *
 * These paths are assumptions until the existing inspection backend
 * documents its real contract. Update this file when that contract is known.
 */
export const backendConfig = {
  timeoutMs: 8000,
  historyPageSize: 25,
  latestFramePollMs: 400,
  heartbeatStaleMs: 8000,
  endpoints: {
    systemStatus: "/api/system/status",
    currentInspection: "/api/inspection/current",
    history: "/api/inspections",
    inspection: (id: string) =>
      `/api/inspections/${encodeURIComponent(id)}`,
    statistics: "/api/statistics",
    analytics: "/api/analytics",
    machineStatus: "/api/machine/status",
    cameraLatest: "/camera/latest",
    cameraCapture: "/camera/capture",
  },
} as const;
