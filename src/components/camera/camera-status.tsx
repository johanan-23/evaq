"use client";

import { StatusBadge } from "@/components/common/status-badge";
import { useInspectionStore } from "@/stores/useInspectionStore";

export function CameraStatus() {
  const status = useInspectionStore((s) => s.cameraStatus);
  return <StatusBadge value={status === "ONLINE" ? "ONLINE" : status} />;
}
