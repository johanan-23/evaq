import { inspectedProducts } from "@/config/brand";
import { toast } from "sonner";
import { deriveFinalDecision } from "@/lib/decision";
import { statsFromHistory, type InspectionDataProvider } from "@/services/providers/types";
import { useInspectionStore } from "@/stores/useInspectionStore";
import type {
  AnalyticsData,
  DimensionResult,
  InspectionResult,
  MachineState,
  PassFailNa,
  VisualCondition,
} from "@/types/inspection";

const PROCESS: MachineState[] = [
  "IDLE",
  "PRODUCT_DETECTED",
  "INDEXING",
  "INSPECTION_READY",
  "CAPTURING",
  "PROCESSING",
  "MEASURING",
  "AI_INFERENCE",
  "DECISION",
];

const STAGE_HOLD_MS: Partial<Record<MachineState, number>> = {
  IDLE: 1000,
  PRODUCT_DETECTED: 1200,
  INDEXING: 1500,
  INSPECTION_READY: 1200,
  CAPTURING: 2000,
  PROCESSING: 2000,
  MEASURING: 1800,
  AI_INFERENCE: 2000,
  DECISION: 1500,
};

const DEFAULT_HOLD_MS = 1500;
const RESULT_HOLD_MS = 2000;

function holdMs(state: MachineState) {
  return STAGE_HOLD_MS[state] ?? DEFAULT_HOLD_MS;
}

const PRODUCTS = inspectedProducts.map((item) => ({
  name: item.name,
  code: item.code,
}));

function dimensionsFor(name: string, fail: boolean): DimensionResult[] {
  if (name === "Metal Sleeve") {
    const od = fail ? 40.42 : 40.08;
    return [
      dim("Outer Diameter", od, 40.0, 39.85, 40.15),
      dim("Inner Diameter", 32.06, 32.0, 31.9, 32.1),
      dim("Length", 25.04, 25.0, 24.8, 25.2),
    ];
  }
  if (name === "Metal Grommet / Bush") {
    const od = fail ? 18.41 : 18.06;
    return [
      dim("Outer Diameter", od, 18.0, 17.85, 18.15),
      dim("Inner Diameter", 8.04, 8.0, 7.9, 8.1),
      dim("Thickness", 6.03, 6.0, 5.85, 6.15),
    ];
  }
  const od = fail ? 52.31 : 52.04;
  return [
    dim("Outer Diameter", od, 52.0, 51.8, 52.2),
    dim("Inner Diameter", 35.08, 35.0, 34.85, 35.15),
    dim("Height", 28.04, 28.0, 27.8, 28.2),
  ];
}

function dim(
  parameter: string,
  measured: number,
  nominal: number,
  lower: number,
  upper: number
): DimensionResult {
  const deviation = measured - nominal;
  const status: PassFailNa =
    measured >= lower && measured <= upper ? "PASS" : "FAIL";
  return {
    parameter,
    measured,
    nominal,
    lowerLimit: lower,
    upperLimit: upper,
    unit: "mm",
    deviation,
    status,
  };
}

function buildInspection(kind: "PASS" | "DEFECT", index: number): InspectionResult {
  const product = PRODUCTS[index % PRODUCTS.length];
  const dimensions = dimensionsFor(product.name, kind === "DEFECT");
  const visualCondition: VisualCondition = "GOOD";
  const dimensionStatus: PassFailNa = dimensions.some((d) => d.status === "FAIL")
    ? "FAIL"
    : "PASS";
  const finalStatus = deriveFinalDecision(dimensionStatus, visualCondition);
  const cycleTimeMs = 4500 + (index % 5) * 80;
  return {
    id: `DEMO-${String(index).padStart(5, "0")}`,
    timestamp: new Date().toISOString(),
    product: {
      name: product.name,
      code: product.code,
      confidence: 0.968,
    },
    dimensions,
    visualInspection: {
      condition: visualCondition,
      confidence: 0.947,
      defectType: visualCondition === "GOOD" ? "None" : "Surface mark",
      model: "inspection_cnn_v1",
      inferenceMs: 42,
    },
    finalDecision: {
      dimensionStatus,
      visualStatus: visualCondition,
      finalStatus,
      reason:
        finalStatus === "DEFECT"
          ? "Outer diameter exceeds tolerance."
          : undefined,
    },
    cycleTimeMs,
    source: "DEMO",
  };
}

function analyticsFrom(history: InspectionResult[]): AnalyticsData {
  const buckets = new Map<string, { inspections: number; pass: number; defect: number; cycle: number[] }>();
  for (const item of history) {
    const key = item.timestamp.slice(0, 16);
    const bucket = buckets.get(key) ?? { inspections: 0, pass: 0, defect: 0, cycle: [] };
    bucket.inspections += 1;
    if (item.finalDecision.finalStatus === "PASS") bucket.pass += 1;
    else bucket.defect += 1;
    if (item.cycleTimeMs) bucket.cycle.push(item.cycleTimeMs);
    buckets.set(key, bucket);
  }
  const overTime = [...buckets.entries()].map(([timestamp, b]) => ({
    timestamp,
    inspections: b.inspections,
    pass: b.pass,
    defect: b.defect,
    cycleTimeMs: b.cycle.length
      ? b.cycle.reduce((a, n) => a + n, 0) / b.cycle.length
      : undefined,
  }));
  const defectTypes = [
    {
      type: "Outer diameter",
      count: history.filter((h) => h.finalDecision.reason?.includes("Outer")).length,
    },
  ].filter((d) => d.count > 0);
  return {
    stats: statsFromHistory(history),
    overTime,
    defectTypes,
    products: PRODUCTS.map((product) => ({
      product: product.name,
      count: history.filter((h) => h.product.name === product.name).length,
    })).filter((item) => item.count > 0),
    source: "DEMO",
  };
}

export function createDemoProvider(): InspectionDataProvider {
  let timer: number | null = null;
  let stepTimer: number | null = null;
  let inCycle = false;
  let index = 480;
  let nextKind: "PASS" | "DEFECT" | "AUTO" = "AUTO";

  const clearStepTimer = () => {
    if (stepTimer) window.clearTimeout(stepTimer);
    stepTimer = null;
  };

  const seed = () => {
    const history = Array.from({ length: 12 }, (_, i) =>
      buildInspection(i % 4 === 0 ? "DEFECT" : "PASS", 468 + i)
    );
    index = 480;
    const store = useInspectionStore.getState();
    store.setSystemMode("DEMO");
    store.setConnectionStatus("CONNECTED");
    store.setBackendStatus("CONNECTED");
    store.setCameraStatus("ONLINE");
    store.setMachineState("IDLE");
    store.setInspectionHistory(history);
    store.setCurrentInspection(null);
    store.setProductionStats(statsFromHistory(history));
    store.setAnalytics(analyticsFrom(history));
    store.setMachineStatus({
      state: "IDLE",
      cycleNumber: index,
      currentCycleTimeMs: null,
      averageCycleTimeMs: statsFromHistory(history).averageCycleTimeMs,
      source: "DEMO",
      components: [
        { id: "esp32", name: "ESP32-CAM", status: "ONLINE" },
        { id: "camera", name: "Camera", status: "ONLINE" },
        { id: "backend", name: "Inspection Backend", status: "ONLINE" },
        { id: "plc", name: "PLC", status: "UNKNOWN" },
        { id: "sensor", name: "Sensor", status: "UNKNOWN" },
        { id: "motor", name: "Motor", status: "UNKNOWN" },
        { id: "lighting", name: "Lighting", status: "UNKNOWN" },
        { id: "reject", name: "Reject System", status: "UNKNOWN" },
      ],
    });
    store.setCycle({ cycleNumber: index });
    store.setLastError(null);
  };

  const complete = (kind: "PASS" | "DEFECT") => {
    index += 1;
    const inspection = buildInspection(kind, index);
    const store = useInspectionStore.getState();
    store.setMachineState(kind === "PASS" ? "PASS" : "REJECT");
    store.prependInspection(inspection);
    store.setCycle({
      cycleNumber: index,
      currentCycleTimeMs: inspection.cycleTimeMs ?? null,
      averageCycleTimeMs: statsFromHistory(store.inspectionHistory).averageCycleTimeMs,
    });
    store.setProductionStats(statsFromHistory(store.inspectionHistory));
    store.setAnalytics(analyticsFrom(store.inspectionHistory));
    store.setMachineStatus({
      ...(store.machineStatus ?? { components: [], source: "DEMO", state: "PASS" }),
      state: kind === "PASS" ? "PASS" : "REJECT",
      cycleNumber: index,
      currentCycleTimeMs: inspection.cycleTimeMs ?? null,
      source: "DEMO",
    });
    toast("Inspection Complete", {
      description: `${inspection.id}  ${inspection.finalDecision.finalStatus}  (DEMO)`,
    });
  };

  const runCycle = (forced?: "PASS" | "DEFECT") => {
    if (inCycle) return;
    inCycle = true;
    const kind =
      forced ??
      (nextKind === "AUTO" ? (index % 5 === 0 ? "DEFECT" : "PASS") : nextKind);
    nextKind = "AUTO";
    let step = 0;
    const tick = () => {
      const state = PROCESS[step];
      useInspectionStore.getState().setMachineState(state);
      useInspectionStore.getState().setCurrentInspection(null);
      step += 1;
      const dwell = holdMs(state);
      if (step < PROCESS.length) {
        stepTimer = window.setTimeout(tick, dwell);
      } else {
        stepTimer = window.setTimeout(() => {
          complete(kind);
          stepTimer = window.setTimeout(() => {
            useInspectionStore.getState().setMachineState("IDLE");
            inCycle = false;
          }, RESULT_HOLD_MS);
        }, dwell);
      }
    };
    tick();
  };

  return {
    start() {
      seed();
    },
    stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
      clearStepTimer();
      inCycle = false;
      useInspectionStore.getState().setMachineState("IDLE");
    },
    nextInspection() {
      runCycle();
    },
    simulatePass() {
      runCycle("PASS");
    },
    simulateDefect() {
      runCycle("DEFECT");
    },
  };
}

export function startDemoLoop(provider: InspectionDataProvider) {
  return window.setInterval(() => provider.nextInspection?.(), 2500);
}

export { startDemoLoop as demoLoop };
