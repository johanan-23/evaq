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
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

const config = {
  cycleTimeMs: { label: "Cycle time (ms)", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function CycleTimeChart() {
  const data = useInspectionStore((s) => s.analytics?.overTime);
  if (!data?.length) {
    return <EmptyState title="NO DATA AVAILABLE" description="Cycle time trend needs completed inspections." />;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs tracking-wide uppercase">Cycle Time Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-56 w-full">
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="timestamp" tickLine={false} axisLine={false} hide />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="cycleTimeMs"
              stroke="var(--color-cycleTimeMs)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
