import { randomUUID } from "crypto";
import { normalizeProbeSiteUrl } from "@/lib/app-env";

export const VERIFY_BOT_UA_PREFIX = "OpenAnalytics-VerifyBot/1.0";

export function buildVerifyUserAgent(token: string): string {
  return `${VERIFY_BOT_UA_PREFIX}; token=${token}`;
}

export function extractVerifyToken(userAgent: string): string | null {
  const match = userAgent.match(/OpenAnalytics-VerifyBot\/1\.0;\s*token=([a-f0-9-]{36})/i);
  return match?.[1] ?? null;
}

export function isVerifyUserAgent(userAgent: string): boolean {
  return userAgent.includes(VERIFY_BOT_UA_PREFIX);
}

export function isVerifyBotVisit(visit: { user_agent: string }): boolean {
  return isVerifyUserAgent(visit.user_agent);
}

interface PendingVerification {
  token: string;
  siteKey: string;
  expiresAt: number;
  completedAt?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __oaBotVerifyPending: Map<string, PendingVerification> | undefined;
}

function pendingStore(): Map<string, PendingVerification> {
  if (!global.__oaBotVerifyPending) {
    global.__oaBotVerifyPending = new Map();
  }
  return global.__oaBotVerifyPending;
}

const VERIFY_TTL_MS = 5 * 60 * 1000;

export function createVerificationChallenge(siteKey: string): string {
  const token = randomUUID();
  pendingStore().set(siteKey, {
    token,
    siteKey,
    expiresAt: Date.now() + VERIFY_TTL_MS,
  });
  return token;
}

export function completeVerification(siteKey: string, token: string): boolean {
  const pending = pendingStore().get(siteKey);
  if (!pending) return false;
  if (pending.token !== token) return false;
  if (Date.now() > pending.expiresAt) {
    pendingStore().delete(siteKey);
    return false;
  }
  pending.completedAt = Date.now();
  return true;
}

export function isVerificationComplete(siteKey: string): boolean {
  const pending = pendingStore().get(siteKey);
  return pending?.completedAt != null;
}

export function getActiveVerificationToken(siteKey: string): string | null {
  const pending = pendingStore().get(siteKey);
  if (!pending || Date.now() > pending.expiresAt) return null;
  return pending.token;
}

export function normalizeSiteUrl(domain: string): string {
  return normalizeProbeSiteUrl(domain);
}

export async function probeSiteForVerification(
  domain: string,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  const base = normalizeSiteUrl(domain);
  const ua = buildVerifyUserAgent(token);

  try {
    const res = await fetch(base, {
      method: "GET",
      headers: {
        "User-Agent": ua,
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });
    console.log("res", res);
    if (res.status >= 500) {
      return { ok: false, error: `Site returned ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reach site";
    return { ok: false, error: message };
  }
}

export async function waitForVerification(
  siteKey: string,
  timeoutMs = 8000,
  intervalMs = 400
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (isVerificationComplete(siteKey)) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return isVerificationComplete(siteKey);
}
