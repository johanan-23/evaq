import { backendConfig } from "@/config/backend";
import { debugLog } from "@/stores/useDebugStore";
import { resolveApiBaseUrl } from "@/lib/connection";
import { getSystemMode } from "@/stores/useSettingsStore";
import {
  parseAnalytics,
  parseHistoryPage,
  parseInspection,
  parseMachineStatus,
  parseStats,
  parseSystemStatus,
} from "@/lib/validate";
import type {
  AnalyticsData,
  HistoryPage,
  HistoryQuery,
  InspectionResult,
  MachineStatusPayload,
  ProductionStats,
  SystemStatus,
} from "@/types/inspection";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function baseUrl() {
  return resolveApiBaseUrl();
}

function source() {
  return getSystemMode();
}

async function request<T>(
  path: string,
  parse: (json: unknown) => T,
  init?: RequestInit
): Promise<T> {
  const root = baseUrl();
  if (!root) {
    throw new ApiError("API base URL is not configured");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), backendConfig.timeoutMs);
  const url = `${root}${path}`;
  debugLog("api", `${init?.method ?? "GET"} ${url}`);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new ApiError(`Request failed (${response.status})`, response.status);
    }
    const json: unknown = await response.json();
    return parse(json);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out");
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed"
    );
  } finally {
    clearTimeout(timeout);
  }
}

function historyQuery(query: HistoryQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.product) params.set("product", query.product);
  if (query.result && query.result !== "ALL") params.set("result", query.result);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDir) params.set("sortDir", query.sortDir);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? backendConfig.historyPageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  getSystemStatus(): Promise<SystemStatus> {
    return request(backendConfig.endpoints.systemStatus, (json) => {
      const parsed = parseSystemStatus(json);
      if (!parsed) throw new ApiError("Malformed system status");
      return parsed;
    });
  },
  getCurrentInspection(): Promise<InspectionResult | null> {
    return request(backendConfig.endpoints.currentInspection, (json) => {
      if (json === null) return null;
      return parseInspection(json, source());
    });
  },
  getInspectionHistory(query: HistoryQuery = {}): Promise<HistoryPage> {
    return request(
      `${backendConfig.endpoints.history}${historyQuery(query)}`,
      (json) => parseHistoryPage(json, source())
    );
  },
  getInspection(id: string): Promise<InspectionResult | null> {
    return request(backendConfig.endpoints.inspection(id), (json) =>
      parseInspection(json, source())
    );
  },
  getStatistics(): Promise<ProductionStats> {
    return request(backendConfig.endpoints.statistics, (json) =>
      parseStats(json, source())
    );
  },
  getAnalytics(): Promise<AnalyticsData> {
    return request(backendConfig.endpoints.analytics, (json) =>
      parseAnalytics(json, source())
    );
  },
  getMachineStatus(): Promise<MachineStatusPayload> {
    return request(backendConfig.endpoints.machineStatus, (json) =>
      parseMachineStatus(json, source())
    );
  },
  captureStill(): Promise<unknown> {
    return request(backendConfig.endpoints.cameraCapture, (json) => json, {
      method: "POST",
    });
  },
};
