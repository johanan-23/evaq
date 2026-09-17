import { api } from "@/services/api";
import type { InspectionDataProvider } from "@/services/providers/types";
import { realtimeService } from "@/services/realtime";
import {
  describeBackendFailure,
  hostLabel,
  resolveApiBaseUrl,
  resolveWsUrl,
} from "@/lib/connection";
import { debugLog } from "@/stores/useDebugStore";
import { useInspectionStore } from "@/stores/useInspectionStore";

function markUnreachable(url: string, error: unknown) {
  const { title, detail } = describeBackendFailure(url, error);
  const store = useInspectionStore.getState();
  store.setBackendStatus("DISCONNECTED");
  store.setConnectionStatus("DISCONNECTED");
  store.setLastError(title, detail);
  store.setMachineState("OFFLINE");
}

export function createLiveProvider(): InspectionDataProvider {
  let pollTimer: number | null = null;
  let stopped = false;

  const refresh = async () => {
    const store = useInspectionStore.getState();
    const apiBaseUrl = resolveApiBaseUrl();
    const wsUrl = resolveWsUrl();

    if (!apiBaseUrl) {
      const { title, detail } = describeBackendFailure("", null);
      store.setBackendStatus("DISCONNECTED");
      store.setConnectionStatus("DISCONNECTED");
      store.setLastError(title, detail);
      store.setMachineState("OFFLINE");
      return;
    }

    try {
      store.setBackendStatus(
        store.backendStatus === "CONNECTED" ? "CONNECTED" : "CONNECTING"
      );

      const settled = await Promise.allSettled([
        api.getMachineStatus(),
        api.getCurrentInspection(),
        api.getInspectionHistory({ page: 1, pageSize: 20 }),
        api.getStatistics(),
        api.getAnalytics(),
      ]);

      if (stopped) return;

      const [machine, current, history, stats, analytics] = settled;
      const succeeded = settled.some(
        (result) => result.status === "fulfilled" && result.value != null
      );
      const firstFailure = settled.find((result) => result.status === "rejected");

      if (!succeeded) {
        const reason =
          firstFailure && firstFailure.status === "rejected"
            ? firstFailure.reason
            : new Error("No inspection endpoints responded");
        debugLog(
          "api",
          reason instanceof Error ? reason.message : "Live refresh failed"
        );
        markUnreachable(apiBaseUrl, reason);
        return;
      }

      store.setBackendStatus("CONNECTED");
      store.setLastError(null, null);
      if (machine.status === "fulfilled" && machine.value) {
        store.setMachineStatus(machine.value);
      }
      if (current.status === "fulfilled" && current.value) {
        store.setCurrentInspection(current.value);
      }
      if (history.status === "fulfilled" && history.value) {
        store.setInspectionHistory(history.value.items, history.value.total);
      }
      if (stats.status === "fulfilled" && stats.value) {
        store.setProductionStats(stats.value);
      }
      if (analytics.status === "fulfilled" && analytics.value) {
        store.setAnalytics(analytics.value);
      }
      if (!wsUrl) {
        store.setConnectionStatus("DISCONNECTED");
      }
    } catch (error) {
      debugLog("api", error instanceof Error ? error.message : "Live refresh failed");
      markUnreachable(apiBaseUrl, error);
    }
  };

  return {
    start() {
      stopped = false;
      const store = useInspectionStore.getState();
      store.resetLive();
      store.setSystemMode("LIVE");
      store.setCameraStatus("UNKNOWN");
      const apiBaseUrl = resolveApiBaseUrl();
      if (!apiBaseUrl) {
        const { title, detail } = describeBackendFailure("", null);
        store.setBackendStatus("DISCONNECTED");
        store.setLastError(title, detail);
      } else {
        store.setBackendStatus("CONNECTING");
        store.setLastError(
          "BACKEND UNREACHABLE",
          `No service is listening at ${hostLabel(apiBaseUrl)}. The API URL is configured, but nothing is running on that port yet. Start the inspection backend, then refresh.`
        );
      }
      void refresh();
      pollTimer = window.setInterval(() => {
        if (useInspectionStore.getState().backendStatus !== "CONNECTED") {
          void refresh();
        }
      }, 5000);
      if (resolveWsUrl()) {
        realtimeService.connect();
      }
    },
    stop() {
      stopped = true;
      if (pollTimer) window.clearInterval(pollTimer);
      realtimeService.disconnect();
    },
  };
}
