"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataValue } from "@/components/common/data-value";
import { StatusBadge } from "@/components/common/status-badge";
import { formatConfidence } from "@/lib/format";
import { useInspectionStore } from "@/stores/useInspectionStore";

export function ProductCard() {
  const inspection = useInspectionStore((s) => s.currentInspection);
  const demo = useInspectionStore((s) => s.systemMode === "DEMO");
  const product = inspection?.product;

  return (
    <Card size="sm" className="h-full">
      <CardHeader>
        <CardTitle className="text-xs tracking-wide text-muted-foreground uppercase">
          Product Identification
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {demo ? <Badge variant="outline" className="w-fit">DEMO</Badge> : null}
        <Field label="Product" value={product?.name ?? "UNKNOWN"} />
        <Field label="Product Code" value={product?.code ?? "UNKNOWN"} />
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">Confidence</p>
          <p>
            <DataValue>{formatConfidence(product?.confidence)}</DataValue>
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">ML result</p>
          <StatusBadge
            value={inspection?.visualInspection.condition ?? "UNKNOWN"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
