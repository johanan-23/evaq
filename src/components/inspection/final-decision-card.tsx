"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { useInspectionStore } from "@/stores/useInspectionStore";
import type { DisplayDecision } from "@/types/inspection";
import { CheckIcon, XIcon, EllipsisIcon, LoaderCircleIcon } from "lucide-react";

export function FinalDecisionCard() {
  const inspection = useInspectionStore((s) => s.currentInspection);
  const machine = useInspectionStore((s) => s.machineState);
  const demo = useInspectionStore((s) => s.systemMode === "DEMO");

  let display: DisplayDecision = "WAITING";
  if (
    machine === "PROCESSING" ||
    machine === "MEASURING" ||
    machine === "AI_INFERENCE" ||
    machine === "CAPTURING" ||
    machine === "DECISION"
  ) {
    display = "PROCESSING";
  }
  if (inspection) {
    display = inspection.finalDecision.finalStatus;
  }

  return (
    <Card size="sm" className="h-full gap-3">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs tracking-wide text-muted-foreground uppercase">
            Final Inspection Result
          </CardTitle>
          {demo ? <Badge variant="outline">DEMO</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <ResultHero status={display} />
        <p className="truncate text-sm">
          <span className="mr-2 text-[11px] text-muted-foreground uppercase">
            Product
          </span>
          {inspection?.product.name ?? "WAITING"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Mini label="Dimension" value={inspection?.finalDecision.dimensionStatus ?? "N/A"} />
          <Mini label="Visual" value={inspection?.finalDecision.visualStatus ?? "UNKNOWN"} />
          <Mini label="Final" value={display} />
        </div>
        {inspection?.finalDecision.reason ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {inspection.finalDecision.reason}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border px-2 py-1.5">
      <p className="mb-1 text-[10px] text-muted-foreground uppercase">{label}</p>
      <StatusBadge value={value} />
    </div>
  );
}

function ResultHero({ status }: { status: DisplayDecision }) {
  const icon =
    status === "PASS" ? (
      <CheckIcon className="size-4" />
    ) : status === "DEFECT" || status === "FAIL" ? (
      <XIcon className="size-4" />
    ) : status === "PROCESSING" ? (
      <LoaderCircleIcon className="size-4 animate-spin" />
    ) : (
      <EllipsisIcon className="size-4" />
    );

  const tone =
    status === "PASS"
      ? "border-status-pass/30 bg-status-pass/10 text-status-pass"
      : status === "DEFECT" || status === "FAIL"
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : "border-border bg-muted text-muted-foreground";

  return (
    <div
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-3 ${tone}`}
      role="status"
      aria-label={`Final result ${status}`}
    >
      {icon}
      <span className="font-data text-lg font-medium tracking-wide">{status}</span>
    </div>
  );
}
