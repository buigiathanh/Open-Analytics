/**
 * Open Analytics — bot tracking helper for Next.js middleware/proxy.
 * Prefer the inline snippet from the dashboard; this file is optional.
 */
const BOT_UA =
  /bot|crawl|spider|slurp|preview|fetcher|archiver|httpclient|headless/i;

function clientIp(request) {
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

/**
 * @param {import("next/server").NextRequest | { headers: Headers; nextUrl?: { pathname: string } }} request
 * @param {{ siteKey: string; apiKey: string; endpoint: string }} opts
 */
export function trackBotVisit(request, opts) {
  if (!opts?.siteKey || !opts?.apiKey || !opts?.endpoint) return;

  const ua = request.headers.get("user-agent") || "";
  if (!BOT_UA.test(ua)) return;

  const path =
    (request.nextUrl?.pathname || "/").slice(0, 500) || "/";
  const ip = clientIp(request);

  fetch(opts.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": opts.apiKey,
    },
    body: JSON.stringify({
      site_key: opts.siteKey,
      user_agent: ua.slice(0, 500),
      path,
      ip: ip?.slice(0, 45) ?? null,
    }),
  }).catch(function () {});
}
