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
import { insertBotVisit } from "@/lib/db/bot-visits";
import type { BotVisit } from "@/lib/types";
import {
  extractVerifyToken,
  isVerifyUserAgent,
} from "@/lib/bot-verify";
import { completeVerification } from "@/lib/bot-verify-server";

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
    return {
      accepted: false,
      message: "Use ingestBotVisit for verification probes",
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

export type BotVisitIngestOutcome =
  | {
      ok: true;
      botId: BotId;
      ipVerified: boolean;
      isVerification: boolean;
      visit: BotVisit;
    }
  | { ok: false; message: string; status: number };

/** Validate bot visit (UA, IP, verify token) and persist to bot_visits. */
export async function ingestBotVisit(
  payload: BotVisitInsertPayload,
  ip: string
): Promise<BotVisitIngestOutcome> {
  const ua = payload.user_agent.trim();

  if (isVerifyUserAgent(ua)) {
    const visit = await insertBotVisit({
      ...payload,
      ip,
      bot_id: "other",
    });

    const token = extractVerifyToken(ua);
    if (!token) {
      return {
        ok: false,
        message: "Invalid verification token",
        status: 422,
      };
    }

    const verified = await completeVerification(payload.site_key, token);
    if (!verified) {
      return {
        ok: false,
        message: "Verification token expired or invalid",
        status: 422,
      };
    }

    return {
      ok: true,
      botId: "other",
      ipVerified: false,
      isVerification: true,
      visit,
    };
  }

  const botCheck = await validateBotVisit(payload, ip);
  if (!botCheck.accepted || !botCheck.botId) {
    return {
      ok: false,
      message: botCheck.message ?? "Bot visit rejected",
      status: 422,
    };
  }

  const visit = await insertBotVisit({
    ...payload,
    ip,
    bot_id: botCheck.botId,
  });

  return {
    ok: true,
    botId: botCheck.botId,
    ipVerified: botCheck.ipVerified ?? false,
    isVerification: false,
    visit,
  };
}
