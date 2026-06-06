import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/session";

const BOT_UA = /bot|crawl|spider|slurp|preview|fetcher|archiver|httpclient|headless/i;
const SITE_KEY = process.env.OPEN_ANALYTICS_SITE_KEY;
const API_KEY = process.env.OPEN_ANALYTICS_API_KEY;
const BOT_ENDPOINT = "http://localhost:3001/api/bot-visits";

function clientIp(request: NextRequest): string | null {
  const h = request.headers;

  const cf = h.get("cf-connecting-ip");
  if (cf && cf.trim()) return cf.trim();

  const trueClient = h.get("true-client-ip");
  if (trueClient && trueClient.trim()) return trueClient.trim();

  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const real = h.get("x-real-ip");
  if (real && real.trim()) return real.trim();

  return null;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const ua = request.headers.get("user-agent") || "";
  console.log("ua", ua);
  if (BOT_UA.test(ua) && SITE_KEY && API_KEY) {
    const path = request.nextUrl.pathname.slice(0, 500) || "/";
    const ip = clientIp(request);
    fetch(BOT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        site_key: SITE_KEY,
        user_agent: ua.slice(0, 500),
        path,
        ip: ip?.slice(0, 45) ?? null,
      }),
    }).catch(() => {});
  }

  return updateSession(request);
}

export const config = {
  // Include `/` so verify probe (GET /) and crawlers hit bot tracking; keep auth refresh on app routes.
  matcher: ["/", "/app/:path*", "/api/sites/:path*"],
};
