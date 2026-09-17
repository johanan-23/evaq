"use client";

import type { OverlayPrimitive } from "@/types/inspection";

export function CameraOverlay({
  overlays,
}: {
  overlays?: OverlayPrimitive[];
}) {
  if (!overlays?.length) return null;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {overlays.map((overlay, index) => {
        const pts = overlay.points ?? [];
        if (overlay.type === "bbox" && pts.length >= 2) {
          const x = Math.min(pts[0].x, pts[1].x);
          const y = Math.min(pts[0].y, pts[1].y);
          const w = Math.abs(pts[1].x - pts[0].x);
          const h = Math.abs(pts[1].y - pts[0].y);
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={w}
              height={h}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
            />
          );
        }
        if (pts.length >= 2) {
          return (
            <polyline
              key={index}
              fill={overlay.type === "region" ? "currentColor" : "none"}
              fillOpacity={overlay.type === "region" ? 0.15 : 0}
              stroke="currentColor"
              strokeWidth="0.6"
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            />
          );
        }
        return null;
      })}
    </svg>
  );
}
