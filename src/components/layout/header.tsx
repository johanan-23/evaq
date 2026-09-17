"use client";

import { ConnectionStatus } from "@/components/layout/connection-status";
import { LiveClock } from "@/components/common/live-clock";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useInspectionStore } from "@/stores/useInspectionStore";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/live": "Live",
  "/history": "History",
  "/analytics": "Analytics",
  "/machine": "Machine",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const camera = useInspectionStore((s) => s.cameraStatus);
  const backend = useInspectionStore((s) => s.backendStatus);
  const connection = useInspectionStore((s) => s.connectionStatus);
  const systemOnline =
    connection === "CONNECTED" || backend === "CONNECTED";
  const title = pageTitles[pathname] ?? "Inspection";

  return (
    <header className="flex h-12 items-center justify-between gap-4 border-b px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <h1 className="truncate text-sm font-medium">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-4">
        <ConnectionStatus
          label="System"
          online={systemOnline}
          text={systemOnline ? "Online" : "Offline"}
        />
        <ConnectionStatus
          label="Camera"
          online={camera === "ONLINE"}
          text={camera === "ONLINE" ? "Online" : "Offline"}
        />
        <ConnectionStatus
          label="Backend"
          online={backend === "CONNECTED"}
          text={
            backend === "CONNECTED"
              ? "Online"
              : backend === "RECONNECTING"
                ? "Reconnect"
                : "Offline"
          }
        />
        <LiveClock className="font-data text-sm tabular-nums" />
      </div>
    </header>
  );
}
