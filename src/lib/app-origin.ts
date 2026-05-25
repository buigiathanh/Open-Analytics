/** Browser-safe app origin for OAuth redirects (must match Supabase Redirect URLs). */
export function getAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (typeof window === "undefined") {
    return fromEnv ?? "http://localhost:3001";
  }
  return fromEnv || window.location.origin;
}
