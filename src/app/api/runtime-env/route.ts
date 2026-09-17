import { publicEnv } from "@/config/env";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const demoModeRaw = process.env.NEXT_PUBLIC_DEMO_MODE?.trim() ?? "";

  return NextResponse.json({
    apiBaseUrl: publicEnv.apiBaseUrl,
    cameraStreamUrl: publicEnv.cameraStreamUrl,
    wsUrl: publicEnv.wsUrl,
    demoMode:
      demoModeRaw === "false" ? false : demoModeRaw === "true" ? true : null,
  });
}
