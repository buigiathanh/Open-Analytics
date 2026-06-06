import { getProjectBySiteKey } from "@/lib/db/projects";
import { hostnameMatchesProjectDomain } from "@/lib/app-env";
import type { BotVisitInsertPayload } from "@/lib/db/bot-visits";
import type { EventInsertPayload } from "@/lib/db/events";
import { SITE_API_KEY_HEADER } from "@/lib/constants";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10_000;
const MAX_STRING = 500;
const MAX_SITE_KEY = 64;
const MAX_API_KEY = 64;
const MAX_ID = 128;

type RateRecord = { count: number; start: number };

declare global {
  // eslint-disable-next-line no-var
  var __oaRateLimitStore: Map<string, RateRecord> | undefined;
}

function rateLimitStore(): Map<string, RateRecord> {
  if (!global.__oaRateLimitStore) {
    global.__oaRateLimitStore = new Map();
  }
  return global.__oaRateLimitStore;
}

export function checkRateLimit(ip: string): boolean {
  const store = rateLimitStore();
  const now = Date.now();
  const record = store.get(ip);

  if (!record) {
    store.set(ip, { count: 1, start: now });
    return true;
  }

  if (now - record.start > RATE_WINDOW_MS) {
    store.set(ip, { count: 1, start: now });
    return true;
  }

  record.count++;
  return record.count <= RATE_LIMIT;
}

function trimStr(value: unknown, max: number): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const s = value.trim();
  return s ? s.slice(0, max) : null;
}

function trimRequired(value: unknown, max: number): string | null {
  const s = trimStr(value, max);
  return s || null;
}

export function validateEventPayload(
  body: unknown
): { ok: true; payload: EventInsertPayload } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid event payload" };
  }

  const b = body as Record<string, unknown>;

  const site_key = trimRequired(b.site_key, MAX_SITE_KEY);
  const visitor_id = trimRequired(b.visitor_id, MAX_ID);
  const session_id = trimRequired(b.session_id, MAX_ID);

  if (!site_key || !visitor_id || !session_id) {
    return { ok: false, message: "Invalid event payload" };
  }

  if (b.latitude != null && typeof b.latitude !== "number") {
    return { ok: false, message: "Invalid latitude" };
  }
  if (b.longitude != null && typeof b.longitude !== "number") {
    return { ok: false, message: "Invalid longitude" };
  }
  if (
    typeof b.latitude === "number" &&
    (b.latitude < -90 || b.latitude > 90)
  ) {
    return { ok: false, message: "Invalid latitude" };
  }
  if (
    typeof b.longitude === "number" &&
    (b.longitude < -180 || b.longitude > 180)
  ) {
    return { ok: false, message: "Invalid longitude" };
  }

  const event_type =
    typeof b.event_type === "number" && Number.isFinite(b.event_type)
      ? Math.trunc(b.event_type)
      : 1;

  return {
    ok: true,
    payload: {
      site_key,
      visitor_id,
      session_id,
      visit_id: trimStr(b.visit_id, MAX_ID),
      event_type,
      path: trimStr(b.path, MAX_STRING),
      page_title: trimStr(b.page_title, MAX_STRING),
      hostname: trimStr(b.hostname, 100),
      url_query: trimStr(b.url_query, MAX_STRING),
      referrer: trimStr(b.referrer, MAX_STRING),
      source: trimStr(b.source, MAX_STRING),
      device:
        typeof b.device === "number" ? Math.trunc(b.device) : null,
      platform:
        typeof b.platform === "number" ? Math.trunc(b.platform) : null,
      browser:
        typeof b.browser === "number" ? Math.trunc(b.browser) : null,
      country_code: trimStr(b.country_code, 2),
      latitude: typeof b.latitude === "number" ? b.latitude : null,
      longitude: typeof b.longitude === "number" ? b.longitude : null,
      duration_ms:
        typeof b.duration_ms === "number"
          ? Math.min(Math.trunc(b.duration_ms), 86_400_000)
          : null,
      language: trimStr(b.language, 35),
      screen: trimStr(b.screen, 32),
      distinct_id: trimStr(b.distinct_id, MAX_ID),
      utm_source: trimStr(b.utm_source, MAX_STRING),
      utm_medium: trimStr(b.utm_medium, MAX_STRING),
      utm_campaign: trimStr(b.utm_campaign, MAX_STRING),
      utm_content: trimStr(b.utm_content, MAX_STRING),
      utm_term: trimStr(b.utm_term, MAX_STRING),
      gclid: trimStr(b.gclid, MAX_STRING),
      fbclid: trimStr(b.fbclid, MAX_STRING),
      msclkid: trimStr(b.msclkid, MAX_STRING),
      event_name: trimStr(b.event_name, MAX_STRING),
    },
  };
}

export function validateBotVisitPayload(
  body: unknown
): { ok: true; payload: BotVisitInsertPayload } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid bot visit payload" };
  }

  const b = body as Record<string, unknown>;
  const site_key = trimRequired(b.site_key, MAX_SITE_KEY);
  const user_agent = trimRequired(b.user_agent, 500);

  if (!site_key || !user_agent) {
    return { ok: false, message: "Invalid bot visit payload" };
  }

  return {
    ok: true,
    payload: {
      site_key,
      user_agent,
      path: trimStr(b.path, MAX_STRING),
      ip: trimStr(b.ip, 45),
    },
  };
}

export function siteApiKeyFromRequest(request: Request): string | null {
  return trimRequired(request.headers.get(SITE_API_KEY_HEADER), MAX_API_KEY);
}

export async function verifySiteForBotVisit(
  request: Request,
  payload: BotVisitInsertPayload,
  opts?: { requireApiKeyHeader?: boolean }
): Promise<{ ok: true } | { ok: false; message: string }> {
  const headerKey = siteApiKeyFromRequest(request);
  const project = await getProjectBySiteKey(payload.site_key);

  if (opts?.requireApiKeyHeader) {
    if (!headerKey) {
      return { ok: false, message: "Missing API key" };
    }
    if (!project) {
      return { ok: false, message: "Unknown site" };
    }
    if (!project.api_key || project.api_key !== headerKey) {
      return { ok: false, message: "Invalid API key" };
    }
    return { ok: true };
  }

  if (headerKey && project?.api_key && headerKey !== project.api_key) {
    return { ok: false, message: "Invalid API key" };
  }

  if (!project) {
    return { ok: false, message: "Unknown site" };
  }
  return { ok: true };
}

/** Reject unknown site_key and hostname/domain mismatch (anti-spam). */
export async function verifySiteForEvent(
  payload: EventInsertPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
  const project = await getProjectBySiteKey(payload.site_key);
  if (!project) {
    return { ok: false, message: "Unknown site key" };
  }

  if (payload.hostname) {
    if (!hostnameMatchesProjectDomain(payload.hostname, project.domain)) {
      return { ok: false, message: "Hostname does not match registered domain" };
    }
  }

  return { ok: true };
}

export { clientIp } from "@/lib/client-ip";
