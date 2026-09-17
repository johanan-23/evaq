import { Badge } from "@/components/ui/badge";
import { useInspectionStore } from "@/stores/useInspectionStore";

export function DemoBanner() {
  const mode = useInspectionStore((s) => s.systemMode);
  if (mode !== "DEMO") return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-1.5">
      <p className="text-xs text-muted-foreground">
        Simulated inspection data is shown for development. It is not production
        measurement.
      </p>
      <Badge variant="outline">DEMO</Badge>
    </div>
  );
}
