export const GSC_SCOPES = [
  "https://www.googleapis.com/auth/webmasters",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export function isGoogleSearchConsoleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET?.trim()
  );
}

export function getGoogleSearchConsoleClientId(): string | null {
  return process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID?.trim() ?? null;
}

export function getGoogleSearchConsoleClientSecret(): string | null {
  return process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET?.trim() ?? null;
}

export function getOAuthStateSecret(): string {
  return (
    process.env.GOOGLE_OAUTH_STATE_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "open-analytics-gsc-state-dev-only"
  );
}
