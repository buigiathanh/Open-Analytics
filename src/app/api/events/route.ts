import { NextResponse } from "next/server";
import { SITE_API_KEY_HEADER } from "@/lib/constants";
import { insertBotVisit } from "@/lib/db/bot-visits";
import { isPostgresConfigured } from "@/lib/db/config";
import { insertEvent } from "@/lib/db/events";
import {
  checkRateLimit,
  clientIp,
  validateBotVisitPayload,
  validateEventPayload,
  verifySiteForBotVisit,
  verifySiteForEvent,
} from "@/lib/event-ingest";
import { broadcastAnalyticsEvent } from "@/lib/realtime-broadcast";

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": `Content-Type, ${SITE_API_KEY_HEADER}`,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonWithCors(
  request: Request,
  body: unknown,
  status = 200
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders(request),
  });
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

async function parseJsonBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isBotPayload(body: unknown): boolean {
  return (
    body != null &&
    typeof body === "object" &&
    (body as Record<string, unknown>).is_bot === true
  );
}

export async function POST(request: Request) {
  if (!isPostgresConfigured()) {
    return jsonWithCors(request, { error: "Database not configured" }, 503);
  }

  const ip = clientIp(request);
  if (!checkRateLimit(ip)) {
    return jsonWithCors(request, { error: "Too many requests" }, 429);
  }

  const body = await parseJsonBody(request);

  if (isBotPayload(body)) {
    const validated = validateBotVisitPayload(body);
    if (!validated.ok) {
      return jsonWithCors(request, { error: validated.message }, 400);
    }

    const siteCheck = await verifySiteForBotVisit(request, validated.payload);
    if (!siteCheck.ok) {
      return jsonWithCors(request, { error: siteCheck.message }, 403);
    }

    try {
      await insertBotVisit({ ...validated.payload, ip });
      return jsonWithCors(request, { ok: true });
    } catch (err) {
      console.error("[events] bot visit insert failed", err);
      return jsonWithCors(request, { error: "Server error" }, 500);
    }
  }

  const validated = validateEventPayload(body);
  if (!validated.ok) {
    return jsonWithCors(request, { error: validated.message }, 400);
  }

  const siteCheck = await verifySiteForEvent(validated.payload);
  if (!siteCheck.ok) {
    return jsonWithCors(request, { error: siteCheck.message }, 403);
  }

  try {
    const event = await insertEvent(validated.payload);
    broadcastAnalyticsEvent(event.site_key, event);
    return jsonWithCors(request, { ok: true });
  } catch (err) {
    console.error("[events] insert failed", err);
    return jsonWithCors(request, { error: "Server error" }, 500);
  }
}
