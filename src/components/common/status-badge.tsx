import { cn } from "@/lib/utils";
import type { ComponentHealth, DisplayDecision, PassFailNa, VisualCondition } from "@/types/inspection";

const passFail: Record<PassFailNa | DisplayDecision | VisualCondition | ComponentHealth | string, string> = {
  PASS: "border-status-pass/40 bg-status-pass/10 text-status-pass",
  GOOD: "border-status-pass/40 bg-status-pass/10 text-status-pass",
  ONLINE: "border-status-pass/40 bg-status-pass/10 text-status-pass",
  FAIL: "border-destructive/40 bg-destructive/10 text-destructive",
  DEFECT: "border-destructive/40 bg-destructive/10 text-destructive",
  REJECT: "border-destructive/40 bg-destructive/10 text-destructive",
  FAULT: "border-destructive/40 bg-destructive/10 text-destructive",
  OFFLINE: "border-border bg-muted text-muted-foreground",
  UNKNOWN: "border-border bg-muted text-muted-foreground",
  "N/A": "border-border bg-muted text-muted-foreground",
  WAITING: "border-border bg-muted text-muted-foreground",
  PROCESSING: "border-status-info/40 bg-status-info/10 text-status-info",
  WARNING: "border-status-warn/40 bg-status-warn/15 text-status-warn-foreground dark:text-status-warn",
  CONNECTED: "border-status-pass/40 bg-status-pass/10 text-status-pass",
  CONNECTING: "border-status-info/40 bg-status-info/10 text-status-info",
  RECONNECTING: "border-status-warn/40 bg-status-warn/15 text-status-warn-foreground dark:text-status-warn",
  DISCONNECTED: "border-border bg-muted text-muted-foreground",
  DEMO: "border-status-warn/40 bg-status-warn/15 text-status-warn-foreground dark:text-status-warn",
  LIVE: "border-status-pass/40 bg-status-pass/10 text-status-pass",
};

export function StatusBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 font-data text-[10px] font-medium tracking-wide uppercase",
        passFail[value] ?? "border-border bg-muted text-muted-foreground",
        className
      )}
    >
      {value}
    </span>
  );
}
