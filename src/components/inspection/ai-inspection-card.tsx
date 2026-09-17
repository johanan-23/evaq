"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { formatConfidence, formatNumber } from "@/lib/format";
import { useInspectionStore } from "@/stores/useInspectionStore";

export function AIInspectionCard() {
  const visual = useInspectionStore((s) => s.currentInspection?.visualInspection);
  const demo = useInspectionStore((s) => s.systemMode === "DEMO");

  return (
    <Card size="sm" className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs tracking-wide text-muted-foreground uppercase">
            AI Visual Inspection
          </CardTitle>
          {demo ? <Badge variant="outline">DEMO</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Row label="Condition">
          <StatusBadge value={visual?.condition ?? "UNKNOWN"} />
        </Row>
        <Row label="Confidence">
          <span className="font-data">{formatConfidence(visual?.confidence)}</span>
        </Row>
        <Row label="Defect Type">{visual?.defectType ?? "N/A"}</Row>
        <Row label="Model">
          <span className="font-data">{visual?.model ?? "N/A"}</span>
        </Row>
        <Row label="Inference">
          <span className="font-data">
            {visual?.inferenceMs != null
              ? `${formatNumber(visual.inferenceMs, 0)} ms`
              : "N/A"}
          </span>
        </Row>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-muted-foreground uppercase">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
