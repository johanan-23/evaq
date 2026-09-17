"use client";

import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useInspectionStore } from "@/stores/useInspectionStore";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const config = {
  count: { label: "Count", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function DefectChart() {
  const data = useInspectionStore((s) => s.analytics?.defectTypes);
  if (!data?.length) {
    return (
      <EmptyState
        title="NO DATA AVAILABLE"
        description="Defect types appear when the backend reports them."
      />
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs tracking-wide uppercase">Defect Types</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-56 w-full">
          <BarChart data={data} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="type" width={120} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={2} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
