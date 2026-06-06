import {
  BOT_DEFINITIONS,
  BOT_OTHER,
  type BotId,
  getBotDefinition,
} from "./bots";
import { isVerifyBotVisit } from "./bot-verify";
import type { BotVisit } from "./types";

const DAY_MS = 86400000;

export interface BotTimeSeriesPoint {
  date: string;
  label: string;
  total: number;
  [botId: string]: number | string;
}

export interface BotPageRow {
  path: string;
  label: string;
  hits: number;
  botIds: BotId[];
  lastSeen: string;
}

export interface BotDashboardAnalytics {
  periodDays: number;
  totalHits: number;
  uniqueBots: number;
  uniquePages: number;
  series: BotTimeSeriesPoint[];
  pages: BotPageRow[];
  botIds: BotId[];
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function buildBotDashboardAnalytics(
  visits: BotVisit[],
  periodDays = 7
): BotDashboardAnalytics {
  const days = periodDays === 30 ? 30 : 7;
  const cutoff = Date.now() - days * DAY_MS;
  const botVisits = visits.filter(
    (v) =>
      !isVerifyBotVisit(v) &&
      new Date(v.created_at).getTime() >= cutoff
  );

  const activeBotIds = new Set<BotId>();
  for (const v of botVisits) {
    activeBotIds.add(v.bot_id);
  }

  const botIds: BotId[] = [
    ...BOT_DEFINITIONS.map((d) => d.id),
    "other",
  ];

  const seriesMap = new Map<string, BotTimeSeriesPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = dayKey(d.toISOString());
    const point: BotTimeSeriesPoint = {
      date,
      label: formatDayLabel(d.toISOString()),
      total: 0,
    };
    for (const id of botIds) point[id] = 0;
    seriesMap.set(date, point);
  }

  for (const v of botVisits) {
    const date = dayKey(v.created_at);
    const botId = v.bot_id;
    let point = seriesMap.get(date);
    if (!point) {
      point = {
        date,
        label: formatDayLabel(v.created_at),
        total: 0,
      };
      for (const id of botIds) point[id] = 0;
      seriesMap.set(date, point);
    }
    point.total = (point.total as number) + 1;
    point[botId] = ((point[botId] as number) ?? 0) + 1;
  }

  const series = Array.from(seriesMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  const pageMap = new Map<
    string,
    { hits: number; botIds: Set<BotId>; lastSeen: string }
  >();
  for (const v of botVisits) {
    const path = v.path?.trim() || "/";
    const botId = v.bot_id;
    const existing = pageMap.get(path);
    if (!existing) {
      pageMap.set(path, {
        hits: 1,
        botIds: new Set([botId]),
        lastSeen: v.created_at,
      });
    } else {
      existing.hits++;
      existing.botIds.add(botId);
      if (v.created_at > existing.lastSeen) existing.lastSeen = v.created_at;
    }
  }

  const pages: BotPageRow[] = Array.from(pageMap.entries())
    .map(([path, data]) => ({
      path,
      label: path,
      hits: data.hits,
      botIds: Array.from(data.botIds).sort((a, b) => {
        const ai = BOT_DEFINITIONS.findIndex((d) => d.id === a);
        const bi = BOT_DEFINITIONS.findIndex((d) => d.id === b);
        const aIdx = a === "other" ? 999 : ai;
        const bIdx = b === "other" ? 999 : bi;
        return aIdx - bIdx;
      }),
      lastSeen: data.lastSeen,
    }))
    .sort((a, b) => b.hits - a.hits);

  return {
    periodDays: days,
    totalHits: botVisits.length,
    uniqueBots: activeBotIds.size,
    uniquePages: pageMap.size,
    series,
    pages,
    botIds,
  };
}

export function botSeriesMeta(botIds: BotId[]) {
  return botIds.map((id) => {
    const def = getBotDefinition(id);
    return {
      id,
      label: id === "other" ? BOT_OTHER.label : def.label,
      color: id === "other" ? BOT_OTHER.color : def.color,
    };
  });
}
