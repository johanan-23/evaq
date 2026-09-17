import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataValue({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-data tracking-tight", className)}>{children}</span>
  );
}
