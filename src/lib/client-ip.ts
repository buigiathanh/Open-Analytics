/** Resolve client IP from common proxy / CDN headers. */
export function clientIpFromHeaders(
  headers: Headers,
  fallbackIp?: string | null
): string | null {
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const trueClient = headers.get("true-client-ip")?.trim();
  if (trueClient) return trueClient;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;

  const fallback = fallbackIp?.trim();
  return fallback || null;
}

export function clientIp(request: Request & { ip?: string | null }): string {
  return clientIpFromHeaders(request.headers, request.ip ?? null) ?? "unknown";
}
