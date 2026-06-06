import { buildBotDashboardAnalytics, type BotDashboardAnalytics } from "./bot-analytics";
import type { BotId } from "./bots";
import type { BotVisit } from "./types";

const DEMO_BOTS: { id: BotId; ua: string; weight: number }[] = [
  {
    id: "google",
    ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    weight: 32,
  },
  {
    id: "bing",
    ua: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    weight: 14,
  },
  {
    id: "ahrefs",
    ua: "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
    weight: 10,
  },
  {
    id: "semrush",
    ua: "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)",
    weight: 9,
  },
  {
    id: "apple",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1)",
    weight: 8,
  },
  {
    id: "chatgpt",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    weight: 12,
  },
  {
    id: "perplexity",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    weight: 9,
  },
  {
    id: "claude",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +https://anthropic.com)",
    weight: 8,
  },
  {
    id: "mistral",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; MistralAI-User/1.0; +https://mistral.ai/bot)",
    weight: 6,
  },
  {
    id: "deepseek",
    ua: "Mozilla/5.0 (compatible; DeepSeekBot/1.0; +https://www.deepseek.com/bot.html)",
    weight: 5,
  },
  {
    id: "cohere",
    ua: "Mozilla/5.0 (compatible; cohere-ai/1.0)",
    weight: 4,
  },
  {
    id: "bytespider",
    ua: "Mozilla/5.0 (compatible; Bytespider; +https://zhanzhang.toutiao.com/)",
    weight: 4,
  },
  {
    id: "commoncrawl",
    ua: "CCBot/2.0 (https://commoncrawl.org/faq/)",
    weight: 3,
  },
  {
    id: "meta",
    ua: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    weight: 6,
  },
  {
    id: "yandex",
    ua: "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
    weight: 5,
  },
  {
    id: "duckduckgo",
    ua: "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
    weight: 4,
  },
  {
    id: "linkedin",
    ua: "LinkedInBot/1.0 (compatible; Mozilla/5.0; +http://www.linkedin.com)",
    weight: 3,
  },
  {
    id: "twitter",
    ua: "Twitterbot/1.0",
    weight: 5,
  },
  {
    id: "other",
    ua: "Mozilla/5.0 (compatible; PetalBot/1.0)",
    weight: 2,
  },
];

const DEMO_PATHS: { path: string; weight: number }[] = [
  { path: "/", weight: 28 },
  { path: "/blog", weight: 18 },
  { path: "/blog/getting-started", weight: 14 },
  { path: "/pricing", weight: 12 },
  { path: "/docs", weight: 11 },
  { path: "/docs/installation", weight: 9 },
  { path: "/about", weight: 6 },
  { path: "/contact", weight: 5 },
  { path: "/changelog", weight: 4 },
  { path: "/privacy-policy", weight: 3 },
];

const DEMO_IPS: Partial<Record<BotId, string[]>> = {
  google: ["66.249.66.1", "66.249.79.10", "66.249.72.45"],
  bing: ["157.55.39.8", "40.77.167.12"],
  ahrefs: ["54.36.148.92", "51.68.215.104"],
  semrush: ["185.191.171.14", "185.191.171.81"],
  apple: ["17.58.98.78"],
  chatgpt: ["104.18.32.45", "104.18.33.12"],
  perplexity: ["52.207.144.10", "54.234.175.82"],
  claude: ["54.36.148.200"],
  mistral: ["51.158.143.12"],
  deepseek: ["103.21.244.0"],
  cohere: ["35.196.85.12"],
  bytespider: ["110.249.201.0"],
  commoncrawl: ["52.86.124.88"],
  meta: ["31.13.64.8", "31.13.65.12"],
  yandex: ["5.45.207.42"],
  duckduckgo: ["40.88.6.12"],
  linkedin: ["108.174.10.10"],
  twitter: ["104.244.42.1", "199.16.158.12"],
  other: ["185.220.101.5"],
};

function demoRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pickWeighted<T extends { weight: number }>(
  items: T[],
  seed: number
): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = demoRand(seed) * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function demoIp(botId: BotId, seed: number): string {
  const pool = DEMO_IPS[botId] ?? DEMO_IPS.other ?? ["203.0.113.10"];
  const idx = Math.floor(demoRand(seed) * pool.length);
  return pool[idx] ?? pool[0];
}

function visitsForDay(
  siteKey: string,
  dayOffset: number,
  periodDays: number,
  startId: number
): BotVisit[] {
  const visits: BotVisit[] = [];
  const day = new Date();
  day.setDate(day.getDate() - dayOffset);
  day.setHours(0, 0, 0, 0);

  const base =
    periodDays === 30
      ? 8 + Math.floor(demoRand(dayOffset + 100) * 18)
      : 12 + Math.floor(demoRand(dayOffset + 50) * 28);
  const weekendBoost = day.getDay() === 0 || day.getDay() === 6 ? -4 : 0;
  const count = Math.max(6, base + weekendBoost);

  for (let i = 0; i < count; i++) {
    const seed = dayOffset * 1000 + i + periodDays * 17;
    const bot = pickWeighted(DEMO_BOTS, seed);
    const path = pickWeighted(DEMO_PATHS, seed + 0.37).path;
    const at = new Date(day);
    at.setHours(
      6 + Math.floor(demoRand(seed + 1) * 16),
      Math.floor(demoRand(seed + 2) * 60),
      Math.floor(demoRand(seed + 3) * 60),
      0
    );

    visits.push({
      id: startId + i,
      site_key: siteKey,
      bot_id: bot.id,
      user_agent: bot.ua,
      path,
      ip: demoIp(bot.id, seed + 4),
      created_at: at.toISOString(),
    });
  }

  return visits;
}

export function generateDemoBotVisits(
  siteKey: string,
  periodDays = 7
): BotVisit[] {
  const days = periodDays === 30 ? 30 : 7;
  const visits: BotVisit[] = [];
  let id = 1;

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const dayVisits = visitsForDay(siteKey, dayOffset, days, id);
    visits.push(...dayVisits);
    id += dayVisits.length;
  }

  return visits.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getDemoBotAnalytics(
  siteKey: string,
  periodDays = 7
): BotDashboardAnalytics {
  return buildBotDashboardAnalytics(
    generateDemoBotVisits(siteKey, periodDays),
    periodDays
  );
}
