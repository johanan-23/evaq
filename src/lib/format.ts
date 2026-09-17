import type { DataSource } from "@/types/inspection";

export function formatNumber(
  value: number | null | undefined,
  digits = 2
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return value.toFixed(digits);
}

export function formatSigned(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} ${unit}`.trim();
}

export function formatMsAsSeconds(ms: number | null | undefined) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) {
    return "N/A";
  }
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return `${(value * 100).toFixed(1)}%`;
}

export function formatConfidence(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  const pct = value <= 1 ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}

export function formatClock(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour12: false });
}

export function formatTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-GB", { hour12: false });
}

export function formatTimeOnly(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleTimeString("en-GB", { hour12: false });
}

export function sourceLabel(source: DataSource) {
  return source === "DEMO" ? "DEMO" : "LIVE";
}
