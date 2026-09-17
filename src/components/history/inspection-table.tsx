"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { InspectionDetails } from "@/components/history/inspection-details";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatConfidence, formatMsAsSeconds, formatTimeOnly } from "@/lib/format";
import { useInspectionStore } from "@/stores/useInspectionStore";
import type { InspectionResult } from "@/types/inspection";

export function InspectionTable({
  items,
  compact,
}: {
  items: InspectionResult[];
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<InspectionResult | null>(null);
  const demo = useInspectionStore((s) => s.systemMode === "DEMO");

  if (!items.length) {
    return (
      <EmptyState
        title="No historical records"
        description="Inspection history will appear after cycles complete."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Sample ID</TableHead>
            <TableHead>Product</TableHead>
            {!compact ? <TableHead>ID</TableHead> : null}
            {!compact ? <TableHead>OD</TableHead> : null}
            {!compact ? <TableHead>Height</TableHead> : null}
            {!compact ? <TableHead>Visual Result</TableHead> : null}
            <TableHead>Result</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Cycle Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => {
            const od = row.dimensions.find((d) =>
              d.parameter.toLowerCase().includes("outer")
            );
            const id = row.dimensions.find((d) =>
              d.parameter.toLowerCase().includes("inner")
            );
            const height = row.dimensions.find((d) =>
              d.parameter.toLowerCase().includes("height")
            );
            return (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => setSelected(row)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSelected(row);
                }}
              >
                <TableCell className="font-data">
                  {formatTimeOnly(row.timestamp)}
                </TableCell>
                <TableCell className="font-data">
                  {row.id}{" "}
                  {demo || row.source === "DEMO" ? (
                    <Badge variant="outline" className="ml-1">
                      DEMO
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell>{row.product.name}</TableCell>
                {!compact ? (
                  <TableCell className="font-data">
                    {id?.measured != null ? id.measured.toFixed(2) : "N/A"}
                  </TableCell>
                ) : null}
                {!compact ? (
                  <TableCell className="font-data">
                    {od?.measured != null ? od.measured.toFixed(2) : "N/A"}
                  </TableCell>
                ) : null}
                {!compact ? (
                  <TableCell className="font-data">
                    {height?.measured != null ? height.measured.toFixed(2) : "N/A"}
                  </TableCell>
                ) : null}
                {!compact ? (
                  <TableCell>
                    <StatusBadge value={row.visualInspection.condition} />
                  </TableCell>
                ) : null}
                <TableCell>
                  <StatusBadge value={row.finalDecision.finalStatus} />
                </TableCell>
                <TableCell className="font-data">
                  {formatConfidence(row.product.confidence)}
                </TableCell>
                <TableCell className="font-data">
                  {formatMsAsSeconds(row.cycleTimeMs)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <InspectionDetails
        inspection={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
