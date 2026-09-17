import type { InspectionResult, ProductionStats } from "@/types/inspection";

export interface InspectionDataProvider {
  start(): void;
  stop(): void;
  nextInspection?(): void;
  simulatePass?(): void;
  simulateDefect?(): void;
}

export function statsFromHistory(history: InspectionResult[]): ProductionStats {
  const total = history.length;
  const passCount = history.filter((item) => item.finalDecision.finalStatus === "PASS").length;
  const defectCount = total - passCount;
  const cycleTimes = history
    .map((item) => item.cycleTimeMs)
    .filter((ms): ms is number => typeof ms === "number");
  const inferences = history
    .map((item) => item.visualInspection.inferenceMs)
    .filter((ms): ms is number => typeof ms === "number");
  return {
    totalInspected: total,
    passCount,
    defectCount,
    passRate: total ? passCount / total : null,
    defectRate: total ? defectCount / total : null,
    averageCycleTimeMs: cycleTimes.length
      ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
      : null,
    averageInferenceMs: inferences.length
      ? inferences.reduce((a, b) => a + b, 0) / inferences.length
      : null,
    source: "DEMO",
  };
}
