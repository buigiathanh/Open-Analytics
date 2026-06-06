import {
  botRequiresIpVerification,
  ipMatchesBotRanges,
  UA_ONLY_BOT_IDS,
} from "@/lib/bot-ip-ranges";
import {
  classifyBot,
  BOT_UA_PATTERN,
  type BotId,
} from "@/lib/bots";
import type { BotVisitInsertPayload } from "@/lib/db/bot-visits";
import {
  completeVerification,
  extractVerifyToken,
  isVerifyUserAgent,
} from "@/lib/bot-verify";

export interface BotIngestResult {
  accepted: boolean;
  botId?: BotId;
  ipVerified?: boolean;
  isVerification?: boolean;
  message?: string;
}

export async function validateBotVisit(
  payload: BotVisitInsertPayload,
  ip: string
): Promise<BotIngestResult> {
  const ua = payload.user_agent.trim();

  if (isVerifyUserAgent(ua)) {
    const token = extractVerifyToken(ua);
    if (!token) {
      return { accepted: false, message: "Invalid verification token" };
    }
    const ok = completeVerification(payload.site_key, token);
    if (!ok) {
      return { accepted: false, message: "Verification token expired or invalid" };
    }
    return {
      accepted: true,
      botId: "other",
      ipVerified: false,
      isVerification: true,
    };
  }

  if (!BOT_UA_PATTERN.test(ua)) {
    return { accepted: false, message: "User-Agent does not match a known bot" };
  }

  const botId = classifyBot(ua);

  if (botRequiresIpVerification(botId)) {
    const matches = await ipMatchesBotRanges(botId, ip);
    if (matches !== true) {
      return {
        accepted: false,
        message: `IP does not match published ranges for ${botId}`,
      };
    }
    return { accepted: true, botId, ipVerified: true };
  }

  if (UA_ONLY_BOT_IDS.has(botId)) {
    return { accepted: true, botId, ipVerified: false };
  }

  return { accepted: false, message: "Unsupported bot" };
}
