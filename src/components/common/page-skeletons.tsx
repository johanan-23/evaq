import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CameraViewportSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-end bg-black/80 p-4",
        className
      )}
    >
      <Skeleton className="absolute inset-3 rounded-lg bg-white/8" />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-28 bg-white/12" />
        <Skeleton className="h-3 w-16 bg-white/12" />
      </div>
    </div>
  );
}

function CardSkeleton({
  headerWidth = "w-40",
  children,
  className,
}: {
  headerWidth?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Skeleton className={cn("h-3", headerWidth)} />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function MetricRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <Skeleton key={row} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="rounded-xl border bg-card px-3 py-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-2 flex-1" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="grid gap-3 xl:grid-cols-12">
        <CardSkeleton headerWidth="w-48" className="xl:col-span-8">
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </CardSkeleton>
        <CardSkeleton headerWidth="w-36" className="xl:col-span-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="mt-3 h-8 w-2/3" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardSkeleton>
        <CardSkeleton headerWidth="w-32" className="xl:col-span-6">
          <Skeleton className="h-24 w-full" />
        </CardSkeleton>
        <CardSkeleton headerWidth="w-32" className="xl:col-span-6">
          <Skeleton className="h-24 w-full" />
        </CardSkeleton>
      </div>
      <CardSkeleton>
        <TableSkeleton rows={4} />
      </CardSkeleton>
      <MetricRowSkeleton />
      <CardSkeleton headerWidth="w-44">
        <TableSkeleton rows={5} />
      </CardSkeleton>
    </div>
  );
}

export function LivePageSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="rounded-xl border bg-card px-3 py-2">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="grid gap-3 xl:grid-cols-12">
        <CardSkeleton headerWidth="w-48" className="xl:col-span-8">
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </CardSkeleton>
        <CardSkeleton headerWidth="w-36" className="xl:col-span-4">
          <Skeleton className="h-28 w-full" />
        </CardSkeleton>
        <CardSkeleton headerWidth="w-32" className="xl:col-span-6">
          <Skeleton className="h-24 w-full" />
        </CardSkeleton>
        <CardSkeleton headerWidth="w-32" className="xl:col-span-6">
          <Skeleton className="h-24 w-full" />
        </CardSkeleton>
      </div>
    </div>
  );
}

export function HistoryPageSkeleton() {
  return (
    <CardSkeleton headerWidth="w-44">
      <div className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
      <TableSkeleton rows={8} />
    </CardSkeleton>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="grid gap-4">
      <MetricRowSkeleton count={6} />
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index}>
            <Skeleton className="h-56 w-full rounded-lg" />
          </CardSkeleton>
        ))}
      </div>
    </div>
  );
}

export function MachinePageSkeleton() {
  return (
    <div className="grid gap-4">
      <MetricRowSkeleton />
      <CardSkeleton headerWidth="w-36">
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </CardSkeleton>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <CardSkeleton key={index} headerWidth="w-28">
          <div className="grid gap-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardSkeleton>
      ))}
    </div>
  );
}

export function RoutePageSkeleton({ pathname }: { pathname: string }) {
  if (pathname.startsWith("/live")) return <LivePageSkeleton />;
  if (pathname.startsWith("/history")) return <HistoryPageSkeleton />;
  if (pathname.startsWith("/analytics")) return <AnalyticsPageSkeleton />;
  if (pathname.startsWith("/machine")) return <MachinePageSkeleton />;
  if (pathname.startsWith("/settings")) return <SettingsPageSkeleton />;
  return <DashboardPageSkeleton />;
}
