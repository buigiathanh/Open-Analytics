import { unstable_cache } from "next/cache";

const SIMILARWEB_API = "https://data.similarweb.com/api/v1/data";
export const SIMILARWEB_CACHE_SECONDS = 60 * 60 * 24 * 3;
const SIMILARWEB_CACHE_KEY_VERSION = "v1";

const LOG_PREFIX = "[similarweb]";

function log(message: string, extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production" && !process.env.SIMILARWEB_DEBUG) {
    return;
  }
  if (extra) {
    console.log(LOG_PREFIX, message, extra);
  } else {
    console.log(LOG_PREFIX, message);
  }
}

class SimilarWebNoDataError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "SimilarWebNoDataError";
  }
}

export type SimilarWebVisitPoint = {
  month: string;
  label: string;
  visits: number;
};

export type SimilarWebKeyword = {
  name: string;
  volume: number | null;
  estimatedValue: number;
  cpc: number | null;
};

export type SimilarWebRanking = {
  globalRank: number | null;
  countryRank: number | null;
  countryCode: string | null;
  categoryRank: number | null;
  category: string | null;
};

export type SimilarWebGeoShare = {
  countryCode: string;
  countryName: string;
  share: number;
};

export type SimilarWebTrafficSource = {
  key: string;
  label: string;
  share: number;
};

export type SimilarWebInsights = {
  domain: string;
  snapshotDate: string | null;
  visitsOverTime: SimilarWebVisitPoint[];
  topKeywords: SimilarWebKeyword[];
  ranking: SimilarWebRanking;
  geography: SimilarWebGeoShare[];
  trafficSources: SimilarWebTrafficSource[];
};

const TRAFFIC_SOURCE_LABELS: Record<string, string> = {
  Direct: "Direct",
  SearchOrganic: "Organic search",
  SearchPaid: "Paid search",
  SocialOrganic: "Organic social",
  SocialPaid: "Paid social",
  Referrals: "Referrals",
  Mail: "Email",
  DisplayAds: "Display ads",
  Affiliate: "Affiliate",
  GenAi: "Gen AI",
};

const countryDisplay = new Intl.DisplayNames(["en"], { type: "region" });

export function normalizeSimilarWebDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

function parsePositiveInt(value: unknown): number | null {
  if (value == null) return null;
  const n =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value).replace(/,/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseShare(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatMonthLabel(monthKey: string): string {
  const d = new Date(`${monthKey}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return monthKey;
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatCategoryLabel(raw: string): string {
  return raw
    .split("/")
    .map((part) =>
      part
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    )
    .join(" / ");
}

function countryNameFromCode(code: string): string {
  try {
    return countryDisplay.of(code) ?? code;
  } catch {
    return code;
  }
}

function parseVisitsOverTime(
  raw: Record<string, unknown> | null | undefined
): SimilarWebVisitPoint[] {
  if (!raw || typeof raw !== "object") return [];

  return Object.entries(raw)
    .map(([month, visits]) => {
      const n =
        typeof visits === "number"
          ? visits
          : Number.parseInt(String(visits), 10);
      if (!Number.isFinite(n) || n < 0) return null;
      return {
        month,
        label: formatMonthLabel(month),
        visits: n,
      };
    })
    .filter((p): p is SimilarWebVisitPoint => p != null)
    .sort((a, b) => a.month.localeCompare(b.month));
}

function parseTopKeywords(raw: unknown): SimilarWebKeyword[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = typeof row.Name === "string" ? row.Name.trim() : "";
      if (!name) return null;

      const estimatedValue =
        typeof row.EstimatedValue === "number"
          ? row.EstimatedValue
          : Number.parseFloat(String(row.EstimatedValue ?? ""));
      if (!Number.isFinite(estimatedValue) || estimatedValue <= 0) return null;

      const volumeRaw = row.Volume;
      const volume =
        volumeRaw == null
          ? null
          : typeof volumeRaw === "number"
            ? volumeRaw
            : Number.parseInt(String(volumeRaw), 10);
      const cpcRaw = row.Cpc;
      const cpc =
        cpcRaw == null
          ? null
          : typeof cpcRaw === "number"
            ? cpcRaw
            : Number.parseFloat(String(cpcRaw));

      return {
        name,
        volume: volume != null && Number.isFinite(volume) ? volume : null,
        estimatedValue,
        cpc: cpc != null && Number.isFinite(cpc) ? cpc : null,
      };
    })
    .filter((k): k is SimilarWebKeyword => k != null)
    .slice(0, 10);
}

function parseRanking(payload: Record<string, unknown>): SimilarWebRanking {
  const global = payload.GlobalRank as Record<string, unknown> | null | undefined;
  const country = payload.CountryRank as Record<string, unknown> | null | undefined;
  const category = payload.CategoryRank as Record<string, unknown> | null | undefined;

  const categoryRaw =
    category && typeof category.Category === "string" ? category.Category : null;

  return {
    globalRank: parsePositiveInt(global?.Rank),
    countryRank: parsePositiveInt(country?.Rank),
    countryCode:
      country && typeof country.CountryCode === "string"
        ? country.CountryCode
        : null,
    categoryRank: parsePositiveInt(category?.Rank),
    category: categoryRaw ? formatCategoryLabel(categoryRaw) : null,
  };
}

function parseGeography(raw: unknown): SimilarWebGeoShare[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const countryCode =
        typeof row.CountryCode === "string" ? row.CountryCode : null;
      const share = parseShare(row.Value);
      if (!countryCode || share == null) return null;
      return {
        countryCode,
        countryName: countryNameFromCode(countryCode),
        share,
      };
    })
    .filter((g): g is SimilarWebGeoShare => g != null)
    .sort((a, b) => b.share - a.share)
    .slice(0, 8);
}

function parseTrafficSources(
  raw: Record<string, unknown> | null | undefined
): SimilarWebTrafficSource[] {
  if (!raw || typeof raw !== "object") return [];

  return Object.entries(raw)
    .map(([key, value]) => {
      const share = parseShare(value);
      if (share == null) return null;
      return {
        key,
        label: TRAFFIC_SOURCE_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").trim(),
        share,
      };
    })
    .filter((s): s is SimilarWebTrafficSource => s != null)
    .sort((a, b) => b.share - a.share);
}

export function parseSimilarWebPayload(
  domain: string,
  payload: unknown
): SimilarWebInsights | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;

  const visitsOverTime = parseVisitsOverTime(
    data.EstimatedMonthlyVisits as Record<string, unknown> | undefined
  );
  const topKeywords = parseTopKeywords(data.TopKeywords);
  const ranking = parseRanking(data);
  const geography = parseGeography(data.TopCountryShares);
  const trafficSources = parseTrafficSources(
    data.TrafficSources as Record<string, unknown> | undefined
  );

  const snapshotDate =
    typeof data.SnapshotDate === "string" ? data.SnapshotDate : null;

  const hasRanking =
    ranking.globalRank != null ||
    ranking.countryRank != null ||
    ranking.categoryRank != null;

  const hasAny =
    visitsOverTime.length > 0 ||
    topKeywords.length > 0 ||
    hasRanking ||
    geography.length > 0 ||
    trafficSources.length > 0;

  if (!hasAny) return null;

  return {
    domain,
    snapshotDate,
    visitsOverTime,
    topKeywords,
    ranking,
    geography,
    trafficSources,
  };
}

async function fetchSimilarWebRaw(domain: string): Promise<unknown | null> {
  const key = normalizeSimilarWebDomain(domain);
  if (!key) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const url = `${SIMILARWEB_API}?domain=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": `Mozilla/5.0 (compatible; OpenAnalytics/1.0${appUrl ? `; +${appUrl}` : ""})`,
      },
      signal: AbortSignal.timeout(15_000),
      next: { revalidate: SIMILARWEB_CACHE_SECONDS },
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;

    return res.json();
  } catch (err) {
    log("fetch: exception", {
      key,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

async function loadSimilarWebInsightsUncached(
  domain: string
): Promise<SimilarWebInsights | null> {
  const key = normalizeSimilarWebDomain(domain);
  const raw = await fetchSimilarWebRaw(key);
  if (!raw) return null;
  return parseSimilarWebPayload(key, raw);
}

export async function getSimilarWebInsights(
  domain: string
): Promise<SimilarWebInsights | null> {
  const key = normalizeSimilarWebDomain(domain);
  if (!key) return null;

  try {
    const cached = unstable_cache(
      async () => {
        const insights = await loadSimilarWebInsightsUncached(key);
        if (!insights) {
          throw new SimilarWebNoDataError("empty-or-unparseable");
        }
        return insights;
      },
      ["similarweb-insights", SIMILARWEB_CACHE_KEY_VERSION, key],
      { revalidate: SIMILARWEB_CACHE_SECONDS }
    );
    return await cached();
  } catch (err) {
    if (err instanceof SimilarWebNoDataError) return null;
    return loadSimilarWebInsightsUncached(key);
  }
}

export function formatVisitCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value);
}

export function formatRank(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercentShare(share: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(share);
}
