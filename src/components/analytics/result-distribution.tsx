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
  pass: { label: "PASS", color: "var(--chart-3)" },
  defect: { label: "DEFECT", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function ResultDistribution() {
  const data = useInspectionStore((s) => s.analytics?.overTime);
  if (!data?.length) {
    return <EmptyState title="NO DATA AVAILABLE" />;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs tracking-wide uppercase">
          PASS vs DEFECT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-56 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="timestamp" hide />
            <YAxis width={32} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="pass" fill="var(--color-pass)" radius={2} />
            <Bar dataKey="defect" fill="var(--color-defect)" radius={2} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
