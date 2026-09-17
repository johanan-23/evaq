"use client";

import { CurrentInspection } from "@/components/inspection/current-inspection";
import { DimensionalTable } from "@/components/inspection/dimensional-table";
import { DemoControls } from "@/components/inspection/demo-controls";
import { InspectionProcess } from "@/components/inspection/inspection-process";

export default function LivePage() {
  return (
    <div className="grid gap-4">
      <DemoControls />
      <InspectionProcess />
      <CurrentInspection />
      <DimensionalTable />
    </div>
  );
}
