import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function isPrivateLan(url: URL) {
  const host = url.hostname;
  return (
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.startsWith("127.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host === "localhost"
  );
}

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");
  if (!src) {
    return new Response("Missing src", { status: 400 });
  }
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new Response("Invalid src", { status: 400 });
  }
  if (!["http:", "https:"].includes(url.protocol) || !isPrivateLan(url)) {
    return new Response("Camera proxy only allows private LAN http(s) URLs", {
      status: 400,
    });
  }
  const upstream = await fetch(url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream camera unavailable", { status: 502 });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ?? "multipart/x-mixed-replace",
      "Cache-Control": "no-store",
    },
  });
}
