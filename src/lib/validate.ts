import { ensureQualityDecision } from "@/lib/decision";
import type {
  AnalyticsData,
  CameraMode,
  CameraStatus,
  ComponentHealth,
  ConnectionStatus,
  DataSource,
  DimensionResult,
  HistoryPage,
  InspectionResult,
  MachineComponent,
  MachineState,
  MachineStatusPayload,
  OverlayPrimitive,
  PassFailNa,
  ProductionStats,
  ProductInfo,
  SystemStatus,
  VisualCondition,
  VisualInspectionResult,
} from "@/types/inspection";

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asOptionalNumber(value: unknown): number | undefined {
  const n = asNumber(value);
  return n === null ? undefined : n;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

const PASS_FAIL: readonly PassFailNa[] = ["PASS", "FAIL", "N/A"];
const VISUAL: readonly VisualCondition[] = ["GOOD", "DEFECT", "UNKNOWN"];
const SOURCE: readonly DataSource[] = ["DEMO", "LIVE"];
const MACHINE: readonly MachineState[] = [
  "IDLE",
  "PRODUCT_DETECTED",
  "INDEXING",
  "INSPECTION_READY",
  "CAPTURING",
  "PROCESSING",
  "MEASURING",
  "AI_INFERENCE",
  "DECISION",
  "PASS",
  "REJECT",
  "FAULT",
  "OFFLINE",
];
const HEALTH: readonly ComponentHealth[] = [
  "ONLINE",
  "OFFLINE",
  "WARNING",
  "UNKNOWN",
];
const CAMERA_STATUS: readonly CameraStatus[] = ["ONLINE", "OFFLINE", "UNKNOWN"];
const CAMERA_MODE: readonly CameraMode[] = [
  "MJPEG_STREAM",
  "LATEST_FRAME",
  "OFFLINE",
];
const CONNECTION: readonly ConnectionStatus[] = [
  "CONNECTED",
  "CONNECTING",
  "RECONNECTING",
  "DISCONNECTED",
];

export function parseProduct(raw: unknown): ProductInfo {
  if (!isRecord(raw)) return { name: "UNKNOWN" };
  return {
    name: asString(raw.name, "UNKNOWN") || "UNKNOWN",
    code: asOptionalString(raw.code),
    confidence: asOptionalNumber(raw.confidence),
  };
}

export function parseDimension(raw: unknown): DimensionResult | null {
  if (!isRecord(raw)) return null;
  const parameter = asString(raw.parameter);
  if (!parameter) return null;
  const measured = asNumber(raw.measured);
  const nominal = asNumber(raw.nominal);
  const deviation =
    asNumber(raw.deviation) ??
    (measured !== null && nominal !== null ? measured - nominal : null);
  return {
    parameter,
    measured,
    nominal,
    lowerLimit: asNumber(raw.lowerLimit ?? raw.lower_limit),
    upperLimit: asNumber(raw.upperLimit ?? raw.upper_limit),
    unit: asString(raw.unit, "mm"),
    deviation,
    status: oneOf(raw.status, PASS_FAIL, "N/A"),
  };
}

export function parseVisual(raw: unknown): VisualInspectionResult {
  if (!isRecord(raw)) {
    return { condition: "UNKNOWN" };
  }
  return {
    condition: oneOf(raw.condition, VISUAL, "UNKNOWN"),
    confidence: asOptionalNumber(raw.confidence),
    defectType: asOptionalString(raw.defectType ?? raw.defect_type),
    model: asOptionalString(raw.model),
    inferenceMs: asOptionalNumber(raw.inferenceMs ?? raw.inference_ms),
  };
}

function parseOverlays(raw: unknown): OverlayPrimitive[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const overlays = raw.flatMap((item) => {
    if (!isRecord(item)) return [];
    const overlayType = oneOf(
      item.type,
      ["bbox", "line", "centerline", "region", "contour", "reference"] as const,
      "bbox"
    );
    if (
      item.type !== "bbox" &&
      item.type !== "line" &&
      item.type !== "centerline" &&
      item.type !== "region" &&
      item.type !== "contour" &&
      item.type !== "reference"
    ) {
      return [];
    }
    const points = Array.isArray(item.points)
      ? item.points.flatMap((p) => {
          if (!isRecord(p)) return [];
          const x = asNumber(p.x);
          const y = asNumber(p.y);
          if (x === null || y === null) return [];
          return [{ x, y }];
        })
      : undefined;
    return [
      {
        type: overlayType,
        points,
        label: asOptionalString(item.label),
      },
    ];
  });
  return overlays.length ? overlays : undefined;
}

export function parseInspection(raw: unknown, fallbackSource: DataSource): InspectionResult | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id);
  if (!id) return null;
  const dimensions = Array.isArray(raw.dimensions)
    ? raw.dimensions.map(parseDimension).filter((d): d is DimensionResult => d !== null)
    : [];
  const visual = parseVisual(raw.visualInspection ?? raw.visual_inspection);
  const dimensionStatus = oneOf(
    isRecord(raw.finalDecision)
      ? raw.finalDecision.dimensionStatus
      : undefined,
    PASS_FAIL,
    dimensions.some((d) => d.status === "FAIL")
      ? "FAIL"
      : dimensions.length
        ? "PASS"
        : "N/A"
  );
  return {
    id,
    timestamp: asString(raw.timestamp, new Date().toISOString()),
    product: parseProduct(raw.product),
    dimensions,
    visualInspection: visual,
    finalDecision: ensureQualityDecision(
      isRecord(raw.finalDecision) ? (raw.finalDecision as never) : undefined,
      dimensionStatus,
      visual.condition
    ),
    cycleTimeMs: asOptionalNumber(raw.cycleTimeMs ?? raw.cycle_time_ms),
    imageUrl: asOptionalString(raw.imageUrl ?? raw.image_url),
    source: oneOf(raw.source, SOURCE, fallbackSource),
    overlays: parseOverlays(raw.overlays),
  };
}

export function parseHistoryPage(raw: unknown, fallbackSource: DataSource): HistoryPage {
  if (Array.isArray(raw)) {
    const items = raw
      .map((item) => parseInspection(item, fallbackSource))
      .filter((item): item is InspectionResult => item !== null);
    return { items, total: items.length, page: 1, pageSize: items.length };
  }
  if (!isRecord(raw)) {
    return { items: [], total: 0, page: 1, pageSize: 25 };
  }
  const items = Array.isArray(raw.items)
    ? raw.items
        .map((item) => parseInspection(item, fallbackSource))
        .filter((item): item is InspectionResult => item !== null)
    : [];
  return {
    items,
    total: asNumber(raw.total) ?? items.length,
    page: asNumber(raw.page) ?? 1,
    pageSize: asNumber(raw.pageSize ?? raw.page_size) ?? 25,
  };
}

export function parseStats(raw: unknown, fallbackSource: DataSource): ProductionStats {
  if (!isRecord(raw)) {
    return {
      totalInspected: 0,
      passCount: 0,
      defectCount: 0,
      passRate: null,
      defectRate: null,
      averageCycleTimeMs: null,
      averageInferenceMs: null,
      source: fallbackSource,
    };
  }
  const total = asNumber(raw.totalInspected ?? raw.total_inspected) ?? 0;
  const pass = asNumber(raw.passCount ?? raw.pass_count) ?? 0;
  const defect = asNumber(raw.defectCount ?? raw.defect_count) ?? 0;
  return {
    totalInspected: total,
    passCount: pass,
    defectCount: defect,
    passRate: asNumber(raw.passRate ?? raw.pass_rate) ?? (total ? pass / total : null),
    defectRate:
      asNumber(raw.defectRate ?? raw.defect_rate) ?? (total ? defect / total : null),
    averageCycleTimeMs: asNumber(
      raw.averageCycleTimeMs ?? raw.average_cycle_time_ms
    ),
    averageInferenceMs: asNumber(
      raw.averageInferenceMs ?? raw.average_inference_ms
    ),
    source: oneOf(raw.source, SOURCE, fallbackSource),
  };
}

export function parseAnalytics(raw: unknown, fallbackSource: DataSource): AnalyticsData {
  const empty: AnalyticsData = {
    stats: parseStats(undefined, fallbackSource),
    overTime: [],
    defectTypes: [],
    products: [],
    source: fallbackSource,
  };
  if (!isRecord(raw)) return empty;
  return {
    stats: parseStats(raw.stats ?? raw, fallbackSource),
    overTime: asArray(raw.overTime ?? raw.over_time).flatMap((p) => {
      if (!isRecord(p)) return [];
      return [
        {
          timestamp: asString(p.timestamp),
          inspections: asNumber(p.inspections) ?? 0,
          pass: asNumber(p.pass) ?? 0,
          defect: asNumber(p.defect) ?? 0,
          cycleTimeMs: asOptionalNumber(p.cycleTimeMs ?? p.cycle_time_ms),
        },
      ];
    }),
    defectTypes: asArray(raw.defectTypes ?? raw.defect_types).flatMap((p) => {
      if (!isRecord(p)) return [];
      return [
        {
          type: asString(p.type, "UNKNOWN"),
          count: asNumber(p.count) ?? 0,
        },
      ];
    }),
    products: asArray(raw.products).flatMap((p) => {
      if (!isRecord(p)) return [];
      return [
        {
          product: asString(p.product, "UNKNOWN"),
          count: asNumber(p.count) ?? 0,
        },
      ];
    }),
    source: oneOf(raw.source, SOURCE, fallbackSource),
  };
}

export function parseMachineStatus(
  raw: unknown,
  fallbackSource: DataSource
): MachineStatusPayload {
  if (!isRecord(raw)) {
    return { state: "OFFLINE", components: [], source: fallbackSource };
  }
  const components: MachineComponent[] = Array.isArray(raw.components)
    ? raw.components.flatMap((c) => {
        if (!isRecord(c)) return [];
        return [
          {
            id: asString(c.id, asString(c.name, "unknown")),
            name: asString(c.name, "Unknown"),
            status: oneOf(c.status, HEALTH, "UNKNOWN"),
            lastCommunication: asOptionalString(
              c.lastCommunication ?? c.last_communication
            ),
            error: asOptionalString(c.error),
          },
        ];
      })
    : [];
  return {
    state: oneOf(raw.state, MACHINE, "OFFLINE"),
    components,
    cycleNumber: asOptionalNumber(raw.cycleNumber ?? raw.cycle_number),
    currentCycleTimeMs: asNumber(
      raw.currentCycleTimeMs ?? raw.current_cycle_time_ms
    ),
    averageCycleTimeMs: asNumber(
      raw.averageCycleTimeMs ?? raw.average_cycle_time_ms
    ),
    source: oneOf(raw.source, SOURCE, fallbackSource),
  };
}

export function parseSystemStatus(raw: unknown): SystemStatus | null {
  if (!isRecord(raw)) return null;
  return {
    systemOnline: Boolean(raw.systemOnline ?? raw.system_online),
    cameraStatus: oneOf(raw.cameraStatus ?? raw.camera_status, CAMERA_STATUS, "UNKNOWN"),
    backendStatus: oneOf(
      raw.backendStatus ?? raw.backend_status,
      CONNECTION,
      "DISCONNECTED"
    ),
    cameraMode: oneOf(raw.cameraMode ?? raw.camera_mode, CAMERA_MODE, "OFFLINE"),
  };
}
