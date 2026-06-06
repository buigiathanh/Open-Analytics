import dns from "dns/promises";
import type { BotId } from "./bots";

type BotIpSource =
  | { staticPrefixes: string[]; url?: never; format?: never }
  | {
      url: string;
      staticPrefixes?: never;
      /** Default: google-style { prefixes: [{ ipv4Prefix }] } */
      format?: "prefixes" | "ahrefs-ips";
    };

/** Published IP prefix lists per bot (IPv4 + IPv6). */
const BOT_IP_SOURCES: Partial<Record<BotId, BotIpSource[]>> = {
  google: [
    {
      url: "https://developers.google.com/static/crawling/ipranges/common-crawlers.json",
    },
  ],
  bing: [{ url: "https://www.bing.com/toolbox/bingbot.json" }],
  apple: [
    { url: "https://search.developer.apple.com/applebot.json" },
  ],
  chatgpt: [
    { url: "https://openai.com/gptbot.json" },
    { url: "https://openai.com/searchbot.json" },
    { url: "https://openai.com/chatgpt-user.json" },
  ],
  semrush: [
    {
      staticPrefixes: [
        "85.208.96.192/27",
        "85.208.98.0/24",
        "185.191.171.0/26",
      ],
    },
  ],
  ahrefs: [
    {
      url: "https://api.ahrefs.com/v3/public/crawler-ip-ranges?output=json",
    },
    {
      url: "https://api.ahrefs.com/v3/public/crawler-ips?output=json",
      format: "ahrefs-ips",
    },
  ],
};

/** Bots we identify by UA only (no public IP list). */
export const UA_ONLY_BOT_IDS = new Set<BotId>([
  "claude",
  "perplexity",
  "mistral",
  "deepseek",
  "cohere",
  "bytespider",
  "commoncrawl",
  "diffbot",
  "you",
  "firecrawl",
  "meta",
  "yandex",
  "duckduckgo",
  "linkedin",
  "twitter",
  "pinterest",
  "baidu",
  "amazon",
  "other",
]);

interface PrefixEntry {
  ipv4Prefix?: string;
  ipv6Prefix?: string;
}

interface IpRangeCache {
  prefixes: string[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var __oaBotIpCache: Map<string, IpRangeCache> | undefined;
}

function cacheStore(): Map<string, IpRangeCache> {
  if (!global.__oaBotIpCache) {
    global.__oaBotIpCache = new Map();
  }
  return global.__oaBotIpCache;
}

function parsePrefixes(json: unknown): string[] {
  if (!json || typeof json !== "object") return [];
  const prefixes = (json as { prefixes?: PrefixEntry[] }).prefixes;
  if (!Array.isArray(prefixes)) return [];
  const out: string[] = [];
  for (const p of prefixes) {
    if (p.ipv4Prefix) out.push(p.ipv4Prefix);
    if (p.ipv6Prefix) out.push(p.ipv6Prefix);
  }
  return out;
}

/** Ahrefs individual IPs outside published ranges — https://help.ahrefs.com/en/articles/78658 */
function parseAhrefsIps(json: unknown): string[] {
  if (!json || typeof json !== "object") return [];
  const ips = (json as { ips?: { ip_address?: string }[] }).ips;
  if (!Array.isArray(ips)) return [];
  return ips
    .map((entry) => entry.ip_address?.trim())
    .filter((ip): ip is string => !!ip && ip.includes("."))
    .map((ip) => `${ip}/32`);
}

async function fetchSourcePrefixes(source: BotIpSource): Promise<string[]> {
  if (source.staticPrefixes) return source.staticPrefixes;
  if (!source.url) return [];

  const res = await fetch(source.url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 21600 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return source.format === "ahrefs-ips"
    ? parseAhrefsIps(json)
    : parsePrefixes(json);
}

export async function getPrefixesForBot(botId: BotId): Promise<string[] | null> {
  const sources = BOT_IP_SOURCES[botId];
  if (!sources) return null;

  const cacheKey = botId;
  const cached = cacheStore().get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.prefixes;
  }

  const all: string[] = [];
  for (const source of sources) {
    const prefixes = await fetchSourcePrefixes(source);
    all.push(...prefixes);
  }

  const unique = [...new Set(all)];
  cacheStore().set(cacheKey, { prefixes: unique, fetchedAt: Date.now() });
  return unique;
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const part of parts) {
    const v = Number(part);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = (n << 8) + v;
  }
  return n >>> 0;
}

function expandIpv6(ip: string): bigint | null {
  let s = ip.toLowerCase();
  if (s.includes("%")) s = s.split("%")[0]!;
  const halves = s.split("::");
  if (halves.length > 2) return null;

  const head = halves[0] ? halves[0].split(":").filter(Boolean) : [];
  const tail = halves[1] ? halves[1].split(":").filter(Boolean) : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0) return null;

  const groups = [...head, ...Array(missing).fill("0"), ...tail];
  if (groups.length !== 8) return null;

  let n = BigInt(0);
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    n = (n << BigInt(16)) + BigInt(parseInt(g, 16));
  }
  return n;
}

function parseCidr(cidr: string): { version: 4 | 6; base: number | bigint; mask: number | bigint } | null {
  const [addr, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  if (!addr || !Number.isInteger(bits)) return null;

  if (addr.includes(":")) {
    if (bits < 0 || bits > 128) return null;
    const base = expandIpv6(addr);
    if (base == null) return null;
    const mask =
      bits === 0
        ? BigInt(0)
        : ((BigInt(1) << BigInt(128)) - BigInt(1)) << BigInt(128 - bits);
    return { version: 6, base: base & mask, mask };
  }

  if (bits < 0 || bits > 32) return null;
  const base = ipv4ToInt(addr);
  if (base == null) return null;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return { version: 4, base: base & mask, mask };
}

export function ipMatchesPrefix(ip: string, prefix: string): boolean {
  const normalized = ip.trim().toLowerCase();
  if (!normalized || normalized === "unknown") return false;

  const cidr = parseCidr(prefix);
  if (!cidr) return false;

  if (cidr.version === 4) {
    const addr = ipv4ToInt(normalized);
    if (addr == null) return false;
    return (addr & (cidr.mask as number)) === (cidr.base as number);
  }

  const addr = expandIpv6(normalized);
  if (addr == null) return false;
  return (addr & (cidr.mask as bigint)) === (cidr.base as bigint);
}

/**
 * Bingbot verification per Microsoft docs:
 * https://www.bing.com/webmasters/help/Verify-Bingbot-2195837f
 * 1. Reverse DNS → hostname must end with .search.msn.com
 * 2. Forward DNS → must resolve back to the same IP
 */
export async function verifyBingbotByDns(ip: string): Promise<boolean> {
  const normalized = ip.trim();
  if (!normalized || normalized === "unknown") return false;

  try {
    const hostnames = await dns.reverse(normalized);
    const hostname = hostnames[0]?.toLowerCase();
    if (!hostname?.endsWith(".search.msn.com")) return false;

    const isV6 = normalized.includes(":");
    const addresses = isV6
      ? await dns.resolve6(hostname)
      : await dns.resolve4(hostname);

    return addresses.some(
      (addr) => addr.toLowerCase() === normalized.toLowerCase()
    );
  } catch {
    return false;
  }
}

export async function verifyBingbotIp(ip: string | null | undefined): Promise<boolean> {
  if (!ip || ip === "unknown") return false;

  const prefixes = await getPrefixesForBot("bing");
  if (prefixes?.some((p) => ipMatchesPrefix(ip, p))) return true;

  return verifyBingbotByDns(ip);
}

export async function ipMatchesBotRanges(
  botId: BotId,
  ip: string | null | undefined
): Promise<boolean | null> {
  if (!ip || ip === "unknown") return false;

  if (botId === "bing") {
    return verifyBingbotIp(ip);
  }

  const prefixes = await getPrefixesForBot(botId);
  if (prefixes == null) return null;
  if (prefixes.length === 0) return false;

  return prefixes.some((p) => ipMatchesPrefix(ip, p));
}

export function botRequiresIpVerification(botId: BotId): boolean {
  return botId in BOT_IP_SOURCES;
}
