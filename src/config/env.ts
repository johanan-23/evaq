function readPublic(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export const publicEnv = {
  cameraStreamUrl: readPublic("NEXT_PUBLIC_CAMERA_STREAM_URL"),
  apiBaseUrl: readPublic("NEXT_PUBLIC_API_BASE_URL"),
  wsUrl: readPublic("NEXT_PUBLIC_WS_URL"),
  demoModeDefault: readPublic("NEXT_PUBLIC_DEMO_MODE") !== "false",
  cameraMode: readPublic("NEXT_PUBLIC_CAMERA_MODE"),
  debugDefault: readPublic("NEXT_PUBLIC_DEBUG") === "true",
  useCameraProxy: readPublic("NEXT_PUBLIC_USE_CAMERA_PROXY") === "true",
};

export type PublicEnv = typeof publicEnv;
