import { NextResponse } from "next/server";
import { ingestBotVisit } from "@/lib/bot-ingest";
import { SITE_API_KEY_HEADER } from "@/lib/constants";
import { isPostgresConfigured } from "@/lib/db/config";
import {
  checkRateLimit,
  clientIp,
  validateBotVisitPayload,
  verifySiteForBotVisit,
} from "@/lib/event-ingest";

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

export async function POST(request: Request) {
  if (!isPostgresConfigured()) {
    return jsonWithCors(request, { error: "Database not configured" }, 503);
  }

  const requestIp = clientIp(request);
  if (!checkRateLimit(requestIp)) {
    return jsonWithCors(request, { error: "Too many requests" }, 429);
  }

  const body = await parseJsonBody(request);
  const validated = validateBotVisitPayload(body);
  if (!validated.ok) {
    return jsonWithCors(request, { error: validated.message }, 400);
  }

  const siteCheck = await verifySiteForBotVisit(request, validated.payload, {
    requireApiKeyHeader: true,
  });
  if (!siteCheck.ok) {
    return jsonWithCors(request, { error: siteCheck.message }, 403);
  }

  const botIp = validated.payload.ip || requestIp;

  try {
    const result = await ingestBotVisit(validated.payload, botIp);
    if (!result.ok) {
      return jsonWithCors(request, { error: result.message }, result.status);
    }
    return jsonWithCors(request, {
      ok: true,
      bot_id: result.botId,
      ip_verified: result.ipVerified,
      verification: result.isVerification,
    });
  } catch (err) {
    console.error("[bot-visits] insert failed", err);
    return jsonWithCors(request, { error: "Server error" }, 500);
  }
}
