const DEFAULT_APP_ORIGIN = "http://localhost:3001";

/** Configured public app URL from env (no trailing slash). */
export function getConfiguredAppOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return url ? url.replace(/\/$/, "") : null;
}

/**
 * App origin for OAuth and post-login redirects.
 * Prefers NEXT_PUBLIC_APP_URL so dev port/proxy matches Supabase Redirect URLs.
 */
export function resolveAppOrigin(requestOrigin?: string): string {
  return getConfiguredAppOrigin() ?? requestOrigin ?? DEFAULT_APP_ORIGIN;
}

/** Browser-safe app origin for OAuth redirectTo (client components). */
export function getAppOrigin(): string {
  if (typeof window === "undefined") {
    return resolveAppOrigin();
  }
  return resolveAppOrigin(window.location.origin);
}
