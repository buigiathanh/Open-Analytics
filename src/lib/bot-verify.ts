export const VERIFY_BOT_UA_PREFIX = "OpenAnalytics-VerifyBot/1.0";

export function buildVerifyUserAgent(token: string): string {
  return `${VERIFY_BOT_UA_PREFIX}; token=${token}`;
}

export function extractVerifyToken(userAgent: string): string | null {
  const match = userAgent.match(
    /OpenAnalytics-VerifyBot\/1\.0;\s*token=([a-f0-9-]{36})/i
  );
  return match?.[1] ?? null;
}

export function isVerifyUserAgent(userAgent: string): boolean {
  return userAgent.includes(VERIFY_BOT_UA_PREFIX);
}

export function isVerifyBotVisit(visit: { user_agent: string }): boolean {
  return isVerifyUserAgent(visit.user_agent);
}
