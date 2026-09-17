"use client";

import { CurrentInspection } from "@/components/inspection/current-inspection";
import { DimensionalTable } from "@/components/inspection/dimensional-table";
import { InspectionProcess } from "@/components/inspection/inspection-process";
import { DemoControls } from "@/components/inspection/demo-controls";
import { ProductionStats } from "@/components/analytics/production-stats";
import { InspectionTable } from "@/components/history/inspection-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInspectionStore } from "@/stores/useInspectionStore";
import { ErrorState } from "@/components/common/error-state";

export default function DashboardPage() {
  const history = useInspectionStore((s) => s.inspectionHistory);
  const lastError = useInspectionStore((s) => s.lastError);
  const lastErrorDetail = useInspectionStore((s) => s.lastErrorDetail);
  const mode = useInspectionStore((s) => s.systemMode);
  const recent = history.slice(0, 8);

  return (
    <div className="grid gap-4">
      {mode === "LIVE" && lastError ? (
        <ErrorState title={lastError} description={lastErrorDetail ?? undefined} />
      ) : null}
      <DemoControls />
      <InspectionProcess />
      <CurrentInspection />
      <DimensionalTable />
      <div>
        <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Production Statistics
        </h2>
        <ProductionStats />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xs tracking-wide uppercase">
            Recent Inspections
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <InspectionTable items={recent} compact />
        </CardContent>
      </Card>
    </div>
  );
}
