import { classifyBot, normalizeBotId, type BotId } from "@/lib/bots";
import { VERIFY_BOT_UA_PREFIX } from "@/lib/bot-verify";
import { query, queryOne } from "@/lib/db/pool";
import type { BotVisit } from "@/lib/types";

function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip || ip === "unknown") return null;
  const trimmed = ip.trim();
  return trimmed ? trimmed.slice(0, 45) : null;
}

function rowToBotVisit(row: Record<string, unknown>): BotVisit {
  return {
    id: Number(row.id),
    site_key: String(row.site_key),
    bot_id: normalizeBotId(row.bot_id != null ? String(row.bot_id) : null),
    user_agent: String(row.user_agent),
    path: row.path != null ? String(row.path) : null,
    ip: row.ip != null ? String(row.ip) : null,
    created_at: new Date(String(row.created_at)).toISOString(),
  };
}

export type BotVisitInsertPayload = Omit<
  BotVisit,
  "id" | "created_at" | "bot_id" | "ip"
> & {
  ip?: string | null;
  bot_id?: BotId;
};

export async function insertBotVisit(
  payload: BotVisitInsertPayload
): Promise<BotVisit> {
  const bot_id = payload.bot_id ?? classifyBot(payload.user_agent);
  const ip = normalizeIp(payload.ip);
  const row = await queryOne(
    `insert into bot_visits (site_key, bot_id, user_agent, path, ip)
    values ($1, $2, $3, $4, $5)
    returning *`,
    [payload.site_key, bot_id, payload.user_agent, payload.path, ip]
  );
  if (!row) throw new Error("Failed to insert bot visit");
  return rowToBotVisit(row);
}

export async function fetchBotVisitsForSite(
  siteKey: string,
  opts: { since?: string; limit?: number } = {}
): Promise<BotVisit[]> {
  const limit = Math.min(opts.limit ?? 5000, 5000);
  const params: unknown[] = [siteKey];
  let sql = `select * from bot_visits where site_key = $1
    and position($2 in user_agent) = 0`;

  params.push(VERIFY_BOT_UA_PREFIX);

  if (opts.since) {
    params.push(opts.since);
    sql += ` and created_at >= $${params.length}`;
  }

  params.push(limit);
  sql += ` order by created_at desc limit $${params.length}`;

  const rows = await query(sql, params);
  return rows.map(rowToBotVisit);
}

export async function hasBotVisitsForSite(siteKey: string): Promise<boolean> {
  const row = await queryOne(
    `select exists(select 1 from bot_visits where site_key = $1 limit 1) as has_visits`,
    [siteKey]
  );
  return row?.has_visits === true;
}
