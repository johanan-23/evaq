"use client";

import { StatusBadge } from "@/components/common/status-badge";
import { useInspectionStore } from "@/stores/useInspectionStore";

export function MachineState() {
  const state = useInspectionStore((s) => s.machineState);
  return <StatusBadge value={state.replaceAll("_", " ")} />;
}
