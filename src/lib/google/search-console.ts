const GSC_BASE = "https://www.googleapis.com/webmasters/v3";

export type GscSiteEntry = {
  siteUrl: string;
  permissionLevel: string;
};

export type GscSearchAnalyticsRow = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscSitemap = {
  path: string;
  lastSubmitted?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  type?: string;
  lastDownloaded?: string;
  warnings?: number;
  errors?: number;
  contents?: { type: string; submitted: number; indexed: number }[];
};

function encodeSiteUrl(siteUrl: string): string {
  return encodeURIComponent(siteUrl);
}

async function gscFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${GSC_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const err = data as { error?: { message?: string } };
    throw new Error(
      err?.error?.message ?? `Search Console API error (${res.status})`
    );
  }

  return data as T;
}

export async function listGscSites(
  accessToken: string
): Promise<GscSiteEntry[]> {
  const data = await gscFetch<{ siteEntry?: GscSiteEntry[] }>(
    accessToken,
    "/sites"
  );
  return data.siteEntry ?? [];
}

export async function querySearchAnalytics(
  accessToken: string,
  siteUrl: string,
  opts: {
    startDate: string;
    endDate: string;
    dimensions?: string[];
    rowLimit?: number;
    startRow?: number;
  }
): Promise<GscSearchAnalyticsRow[]> {
  const body: Record<string, unknown> = {
    startDate: opts.startDate,
    endDate: opts.endDate,
    dimensions: opts.dimensions ?? ["date"],
    rowLimit: opts.rowLimit ?? 1000,
  };
  if (opts.startRow != null && opts.startRow > 0) {
    body.startRow = opts.startRow;
  }

  const data = await gscFetch<{ rows?: GscSearchAnalyticsRow[] }>(
    accessToken,
    `/sites/${encodeSiteUrl(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
  return data.rows ?? [];
}

const BREAKDOWN_BATCH = 250;

/** Fetch up to maxRows for a single dimension (paginates GSC API). */
export async function fetchBreakdownDimension(
  accessToken: string,
  siteUrl: string,
  opts: {
    startDate: string;
    endDate: string;
    dimension: "query" | "page" | "country" | "device";
    maxRows: number;
  }
): Promise<{ rows: GscSearchAnalyticsRow[]; truncated: boolean }> {
  const collected: GscSearchAnalyticsRow[] = [];
  let startRow = 0;

  while (collected.length < opts.maxRows) {
    const limit = Math.min(BREAKDOWN_BATCH, opts.maxRows - collected.length);
    const batch = await querySearchAnalytics(accessToken, siteUrl, {
      startDate: opts.startDate,
      endDate: opts.endDate,
      dimensions: [opts.dimension],
      rowLimit: limit,
      startRow,
    });

    if (batch.length === 0) break;
    collected.push(...batch);
    if (batch.length < limit) break;
    startRow += batch.length;
  }

  return {
    rows: collected,
    truncated: collected.length >= opts.maxRows,
  };
}

export async function listSitemaps(
  accessToken: string,
  siteUrl: string
): Promise<GscSitemap[]> {
  const data = await gscFetch<{ sitemap?: GscSitemap[] }>(
    accessToken,
    `/sites/${encodeSiteUrl(siteUrl)}/sitemaps`
  );
  return data.sitemap ?? [];
}

export async function submitSitemap(
  accessToken: string,
  siteUrl: string,
  feedpath: string
): Promise<void> {
  await gscFetch(
    accessToken,
    `/sites/${encodeSiteUrl(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`,
    { method: "PUT" }
  );
}

export async function deleteSitemap(
  accessToken: string,
  siteUrl: string,
  feedpath: string
): Promise<void> {
  await gscFetch(
    accessToken,
    `/sites/${encodeSiteUrl(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`,
    { method: "DELETE" }
  );
}

/** Pick best GSC property for a project domain. */
export function matchGscProperty(
  sites: GscSiteEntry[],
  domain: string
): string | null {
  const normalized = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/^www\./, "");

  if (!normalized) return null;

  const domainProp = `sc-domain:${normalized}`;
  const exact = sites.find((s) => s.siteUrl === domainProp);
  if (exact) return exact.siteUrl;

  const urlProps = sites.filter((s) => s.siteUrl.startsWith("http"));
  for (const s of urlProps) {
    try {
      const host = new URL(s.siteUrl).hostname
        .toLowerCase()
        .replace(/^www\./, "");
      if (host === normalized) return s.siteUrl;
    } catch {
      /* skip invalid */
    }
  }

  const partial = sites.find((s) =>
    s.siteUrl.toLowerCase().includes(normalized)
  );
  return partial?.siteUrl ?? null;
}

export function formatGscDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function gscDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return {
    startDate: formatGscDate(start),
    endDate: formatGscDate(end),
  };
}
