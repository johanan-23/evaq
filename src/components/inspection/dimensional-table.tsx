"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatSigned } from "@/lib/format";
import { useInspectionStore } from "@/stores/useInspectionStore";

export function DimensionalTable() {
  const inspection = useInspectionStore((s) => s.currentInspection);
  const demo = useInspectionStore((s) => s.systemMode === "DEMO");
  const rows = inspection?.dimensions ?? [];

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs tracking-wide uppercase">
            Dimensional Inspection
          </CardTitle>
          {demo ? <Badge variant="outline">DEMO</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {rows.length === 0 ? (
          <EmptyState
            className="m-4"
            title="No inspection data"
            description="WAITING FOR INSPECTION"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Measured</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Lower Limit</TableHead>
                <TableHead>Upper Limit</TableHead>
                <TableHead>Deviation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.parameter}>
                  <TableCell>{row.parameter}</TableCell>
                  <TableCell className="font-data">
                    {row.measured === null
                      ? "N/A"
                      : `${formatNumber(row.measured)} ${row.unit}`}
                  </TableCell>
                  <TableCell className="font-data">
                    {row.nominal === null
                      ? "N/A"
                      : `${formatNumber(row.nominal)} ${row.unit}`}
                  </TableCell>
                  <TableCell className="font-data">
                    {row.lowerLimit === null
                      ? "N/A"
                      : `${formatNumber(row.lowerLimit)} ${row.unit}`}
                  </TableCell>
                  <TableCell className="font-data">
                    {row.upperLimit === null
                      ? "N/A"
                      : `${formatNumber(row.upperLimit)} ${row.unit}`}
                  </TableCell>
                  <TableCell className="font-data">
                    {formatSigned(row.deviation ?? null, row.unit)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
