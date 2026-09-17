"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatConfidence, formatMsAsSeconds, formatTimestamp } from "@/lib/format";
import type { InspectionResult } from "@/types/inspection";
import { useInspectionStore } from "@/stores/useInspectionStore";

export function InspectionDetails({
  inspection,
  onClose,
}: {
  inspection: InspectionResult | null;
  onClose: () => void;
}) {
  const [raw, setRaw] = useState(false);
  const setCurrent = useInspectionStore((s) => s.setCurrentInspection);

  return (
    <Sheet open={Boolean(inspection)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl" side="right">
        {inspection ? (
          <>
            <SheetHeader>
              <SheetTitle className="font-data">{inspection.id}</SheetTitle>
              <SheetDescription>
                {formatTimestamp(inspection.timestamp)}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 p-4">
              {inspection.source === "DEMO" ? (
                <Badge variant="outline" className="w-fit">
                  DEMO
                </Badge>
              ) : null}
              <p className="text-sm">
                <span className="text-muted-foreground">Product: </span>
                {inspection.product.name}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Code: </span>
                {inspection.product.code ?? "N/A"}
              </p>
              <div className="flex gap-2">
                <StatusBadge value={inspection.finalDecision.finalStatus} />
                <StatusBadge value={inspection.visualInspection.condition} />
              </div>
              <p className="text-sm">
                AI confidence:{" "}
                <span className="font-data">
                  {formatConfidence(inspection.visualInspection.confidence)}
                </span>
              </p>
              <p className="text-sm">
                Cycle time:{" "}
                <span className="font-data">
                  {formatMsAsSeconds(inspection.cycleTimeMs)}
                </span>
              </p>
              {inspection.finalDecision.reason ? (
                <p className="text-sm">{inspection.finalDecision.reason}</p>
              ) : null}
              {inspection.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={inspection.imageUrl}
                  alt={`Inspection ${inspection.id}`}
                  className="w-full rounded-lg border"
                />
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  IMAGE NOT AVAILABLE
                </div>
              )}
              <Button size="sm" variant="outline" onClick={() => setCurrent(inspection)}>
                Load as current inspection
              </Button>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Parameter</th>
                    <th className="p-2">Measured</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inspection.dimensions.map((d) => (
                    <tr key={d.parameter} className="border-b">
                      <td className="p-2">{d.parameter}</td>
                      <td className="p-2 font-data">
                        {d.measured == null
                          ? "N/A"
                          : `${d.measured.toFixed(2)} ${d.unit}`}
                      </td>
                      <td className="p-2">
                        <StatusBadge value={d.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button size="sm" variant="ghost" onClick={() => setRaw((v) => !v)}>
                {raw ? "Hide Raw Data" : "View Raw Data"}
              </Button>
              {raw ? (
                <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 font-data text-xs">
                  {JSON.stringify(inspection, null, 2)}
                </pre>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
