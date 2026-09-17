import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  demo,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  demo?: boolean;
  className?: string;
}) {
  return (
    <Card size="sm" className={cn("gap-2", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-data text-xl font-medium tracking-tight">{value}</p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
        {demo ? (
          <p className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Demo data
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
