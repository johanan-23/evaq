"use client";

import { useInspectionStore } from "@/stores/useInspectionStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDebugStore } from "@/stores/useDebugStore";
import { getCameraConfig } from "@/services/camera";

export function DebugPanel() {
  const enabled = useSettingsStore((s) => s.debugPanel);
  const events = useDebugStore((s) => s.events);
  const lastWs = useDebugStore((s) => s.lastWsEvent);
  const lastApi = useDebugStore((s) => s.lastApiRequest);
  const machine = useInspectionStore((s) => s.machineState);
  const camera = getCameraConfig();

  if (!enabled || process.env.NODE_ENV === "production") return null;

  return (
    <aside className="border-t bg-muted/30 px-4 py-2 font-data text-[10px] text-muted-foreground">
      <div className="flex flex-wrap gap-4">
        <span>Camera: {camera.streamUrl ?? "none"}</span>
        <span>Mode: {camera.mode}</span>
        <span>Machine: {machine}</span>
        <span>Last API: {lastApi ?? "—"}</span>
        <span>Last WS: {lastWs ?? "—"}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-2">
        {events.slice(0, 8).map((event, i) => (
          <span key={`${event.time}-${i}`}>
            [{event.channel}] {event.message}
          </span>
        ))}
      </div>
    </aside>
  );
}
