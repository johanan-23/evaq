import { cn } from "@/lib/utils";

export function ConnectionStatus({
  label,
  online,
  text,
}: {
  label: string;
  online: boolean;
  text: string;
}) {
  return (
    <p
      className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
      aria-label={`${label} ${text}`}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          online ? "animate-pulse bg-status-pass" : "bg-muted-foreground"
        )}
      />
      <span>{label}</span>
    </p>
  );
}
