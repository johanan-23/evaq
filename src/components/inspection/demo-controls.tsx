"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInspectionRuntime } from "@/components/providers/inspection-runtime";
import { useSettingsStore } from "@/stores/useSettingsStore";

export function DemoControls() {
  const demo = useSettingsStore((s) => s.demoMode);
  const runtime = useInspectionRuntime();
  if (!demo) return null;
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-xs tracking-wide uppercase">Demo Controls</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button size="sm" onClick={runtime.startDemo} disabled={runtime.running}>
          Start Demo
        </Button>
        <Button size="sm" variant="outline" onClick={runtime.stopDemo}>
          Stop Demo
        </Button>
        <Button size="sm" variant="secondary" onClick={runtime.nextInspection}>
          Next Inspection
        </Button>
        <Button size="sm" variant="outline" onClick={runtime.simulatePass}>
          Simulate Pass
        </Button>
        <Button size="sm" variant="destructive" onClick={runtime.simulateDefect}>
          Simulate Defect
        </Button>
      </CardContent>
    </Card>
  );
}
