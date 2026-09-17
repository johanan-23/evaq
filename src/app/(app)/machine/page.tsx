"use client";

import { MachineStatus } from "@/components/machine/machine-status";
import { InspectionProcess } from "@/components/inspection/inspection-process";
import { ErrorState } from "@/components/common/error-state";
import { useInspectionStore } from "@/stores/useInspectionStore";

export default function MachinePage() {
  const error = useInspectionStore((s) => s.lastError);
  const errorDetail = useInspectionStore((s) => s.lastErrorDetail);
  const mode = useInspectionStore((s) => s.systemMode);
  return (
    <div className="grid gap-4">
      {mode === "LIVE" && error ? (
        <ErrorState title={error} description={errorDetail ?? undefined} />
      ) : null}
      <InspectionProcess />
      <MachineStatus />
    </div>
  );
}
