"use client";

import { MetricCard } from "@/components/common/metric-card";
import { formatMsAsSeconds, formatPercent } from "@/lib/format";
import { useInspectionStore } from "@/stores/useInspectionStore";

export function ProductionStats() {
  const stats = useInspectionStore((s) => s.productionStats);
  const mode = useInspectionStore((s) => s.systemMode);
  const demo = stats?.source === "DEMO" || mode === "DEMO";

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <MetricCard label="Total Inspected" value={String(stats?.totalInspected ?? 0)} demo={demo} />
      <MetricCard label="Pass" value={String(stats?.passCount ?? 0)} demo={demo} />
      <MetricCard label="Defect" value={String(stats?.defectCount ?? 0)} demo={demo} />
      <MetricCard label="Pass Rate" value={formatPercent(stats?.passRate ?? null)} demo={demo} />
      <MetricCard label="Defect Rate" value={formatPercent(stats?.defectRate ?? null)} demo={demo} />
      <MetricCard
        label="Average Cycle Time"
        value={formatMsAsSeconds(stats?.averageCycleTimeMs ?? null)}
        demo={demo}
      />
    </div>
  );
}
