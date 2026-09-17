"use client";

import { ProductionStats } from "@/components/analytics/production-stats";
import { CycleTimeChart } from "@/components/analytics/cycle-time-chart";
import { ResultDistribution } from "@/components/analytics/result-distribution";
import { DefectChart } from "@/components/analytics/defect-chart";
import { MetricCard } from "@/components/common/metric-card";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInspectionStore } from "@/stores/useInspectionStore";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const productConfig = {
  count: { label: "Count", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const analytics = useInspectionStore((s) => s.analytics);
  const demo = useInspectionStore((s) => s.systemMode === "DEMO");
  const products = analytics?.products ?? [];

  const empty = !analytics || analytics.stats.totalInspected === 0;

  return empty ? (
      <EmptyState
        title="NO DATA AVAILABLE"
        description="Analytics appear after inspection results are recorded."
      />
    ) : (
    <div className="grid gap-4">
      <ProductionStats />
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Average AI Inference"
          value={
            analytics.stats.averageInferenceMs != null
              ? `${analytics.stats.averageInferenceMs.toFixed(0)} ms`
              : "N/A"
          }
          demo={demo}
        />
        <MetricCard
          label="Inspections over sample"
          value={String(analytics.overTime.reduce((s, p) => s + p.inspections, 0))}
          demo={demo}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs tracking-wide uppercase">
              Inspections Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.overTime.length ? (
              <ChartContainer
                config={{
                  inspections: { label: "Inspections", color: "var(--chart-2)" },
                }}
                className="aspect-auto h-56 w-full"
              >
                <BarChart data={analytics.overTime}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis width={32} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="inspections" fill="var(--color-inspections)" radius={2} />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyState title="NO DATA AVAILABLE" />
            )}
          </CardContent>
        </Card>
        <ResultDistribution />
        <CycleTimeChart />
        <DefectChart />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xs tracking-wide uppercase">
            Product Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length ? (
            <ChartContainer config={productConfig} className="aspect-auto h-56 w-full">
              <BarChart data={products}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="product" tickLine={false} />
                <YAxis width={32} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={2} />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyState title="NO DATA AVAILABLE" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
