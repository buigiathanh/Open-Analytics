import { normalizeProbeSiteUrl } from "@/lib/app-env";
import { buildVerifyUserAgent } from "@/lib/bot-verify";
import {
  isVerificationComplete as isVerificationCompleteInDb,
  markVerificationComplete,
  upsertVerificationChallenge,
} from "@/lib/db/bot-verify-challenges";
import { randomUUID } from "crypto";

export async function createVerificationChallenge(
  siteKey: string
): Promise<string> {
  const token = randomUUID();
  await upsertVerificationChallenge(siteKey, token);
  return token;
}

export async function completeVerification(
  siteKey: string,
  token: string
): Promise<boolean> {
  return markVerificationComplete(siteKey, token);
}

export async function isVerificationComplete(
  siteKey: string
): Promise<boolean> {
  return isVerificationCompleteInDb(siteKey);
}

export async function probeSiteForVerification(
  domain: string,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  const base = normalizeProbeSiteUrl(domain);
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
    if (await isVerificationComplete(siteKey)) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return isVerificationComplete(siteKey);
}
