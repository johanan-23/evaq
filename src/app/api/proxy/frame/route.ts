import { backendConfig } from "@/config/backend";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_BASE_URL is not configured" },
      { status: 503 }
    );
  }
  const upstream = await fetch(`${base}${backendConfig.endpoints.cameraLatest}`, {
    cache: "no-store",
  });
  if (!upstream.ok) {
    return new Response("Frame unavailable", { status: 502 });
  }
  const contentType = upstream.headers.get("Content-Type") ?? "image/jpeg";
  return new Response(upstream.body, {
    headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
  });
}
