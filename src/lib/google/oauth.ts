import { createHmac, timingSafeEqual } from "crypto";
import { getOAuthStateSecret, GSC_SCOPES } from "./config";
import {
  getGoogleSearchConsoleClientId,
  getGoogleSearchConsoleClientSecret,
} from "./config";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export type GscOAuthState = {
  siteId: string;
  userId: string;
  exp: number;
};

function signPayload(encoded: string): string {
  return createHmac("sha256", getOAuthStateSecret())
    .update(encoded)
    .digest("base64url");
}

export function encodeOAuthState(state: GscOAuthState): string {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  const sig = signPayload(payload);
  return `${payload}.${sig}`;
}

export function decodeOAuthState(token: string): GscOAuthState | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = signPayload(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as GscOAuthState;
    if (!parsed.siteId || !parsed.userId || !parsed.exp) return null;
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const clientId = getGoogleSearchConsoleClientId();
  if (!clientId) throw new Error("Google Search Console OAuth is not configured.");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GSC_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<GoogleTokenResponse> {
  const clientId = getGoogleSearchConsoleClientId();
  const clientSecret = getGoogleSearchConsoleClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("Google Search Console OAuth is not configured.");
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description ?? data.error ?? "Token exchange failed.");
  }
  return data as GoogleTokenResponse;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<GoogleTokenResponse> {
  const clientId = getGoogleSearchConsoleClientId();
  const clientSecret = getGoogleSearchConsoleClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("Google Search Console OAuth is not configured.");
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description ?? data.error ?? "Token refresh failed.");
  }
  return data as GoogleTokenResponse;
}

export async function fetchGoogleUserEmail(
  accessToken: string
): Promise<string | null> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { email?: string };
  return data.email ?? null;
}
