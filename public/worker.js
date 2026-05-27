/**
 * Open Analytics — Cloudflare Worker ingest proxy
 *
 * Receives POST JSON from tracker.js (data-endpoint), rate-limits by IP,
 * and inserts into Supabase events using the Secret key (bypasses RLS).
 *
 * Deploy: see /docs/worker in the dashboard docs.
 */
const SUPABASE_PROJECT_ID = "xxxxxxxx";
const SUPABASE_SECRET_KEY = "xxxxxxxxxxxx";
const RATE_LIMIT = 20;
const WINDOW = 10 * 1000;

const ipStore = new Map();

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function withCors(request, response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function jsonResponse(request, body, status = 200) {
  return withCors(
    request,
    new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function isValidEvent(body) {
  if (!body || typeof body !== "object") return false;
  if (typeof body.site_key !== "string" || !body.site_key.trim()) return false;
  if (typeof body.visitor_id !== "string" || !body.visitor_id.trim()) return false;
  if (typeof body.session_id !== "string" || !body.session_id.trim()) return false;
  if (body.latitude != null && typeof body.latitude !== "number") return false;
  if (body.longitude != null && typeof body.longitude !== "number") return false;
  if (
    typeof body.latitude === "number" &&
    (body.latitude < -90 || body.latitude > 90)
  ) {
    return false;
  }
  if (
    typeof body.longitude === "number" &&
    (body.longitude < -180 || body.longitude > 180)
  ) {
    return false;
  }
  return true;
}

async function parseJsonBody(request) {
  const text = await request.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default {
  async fetch(request) {
    try {
      if (request.method === "OPTIONS") {
        return withCors(request, new Response(null, { status: 204 }));
      }

      if (request.method !== "POST") {
        return jsonResponse(request, "Method not allowed", 405);
      }

      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const now = Date.now();
      const record = ipStore.get(ip);

      if (!record) {
        ipStore.set(ip, { count: 1, start: now });
      } else if (now - record.start > WINDOW) {
        ipStore.set(ip, { count: 1, start: now });
      } else {
        record.count++;
        if (record.count > RATE_LIMIT) {
          return jsonResponse(request, "Too many requests", 429);
        }
      }

      const body = await parseJsonBody(request);
      if (!isValidEvent(body)) {
        return jsonResponse(request, "Invalid event payload", 400);
      }

      const res = await fetch(
        `https://${SUPABASE_PROJECT_ID}.supabase.co/rest/v1/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_SECRET_KEY,
            Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify([body]),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        return jsonResponse(request, { error: "Supabase error", detail: errText }, 500);
      }

      return jsonResponse(request, { ok: true });
    } catch (err) {
      console.log(err);
      return jsonResponse(request, "Server error", 500);
    }
  },
};
