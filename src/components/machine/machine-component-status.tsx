"use client";

import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestamp } from "@/lib/format";
import { useInspectionStore } from "@/stores/useInspectionStore";

export function MachineComponentStatus() {
  const components = useInspectionStore((s) => s.machineStatus?.components);
  const source = useInspectionStore((s) => s.machineStatus?.source);

  if (!components?.length) {
    return (
      <EmptyState
        title="No component status"
        description="The frontend displays only components reported by the backend."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {components.map((component) => (
        <Card key={component.id} size="sm">
          <CardHeader>
            <CardTitle className="text-sm">{component.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <StatusBadge value={component.status} />
            <p className="text-xs text-muted-foreground">
              Last communication:{" "}
              {component.lastCommunication
                ? formatTimestamp(component.lastCommunication)
                : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              Error: {component.error ?? "None reported"}
            </p>
            {source === "DEMO" ? (
              <p className="text-[10px] uppercase text-muted-foreground">Demo</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
