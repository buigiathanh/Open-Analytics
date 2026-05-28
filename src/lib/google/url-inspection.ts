const INSPECT_BASE =
  "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";

export type UrlInspectionSummary = {
  verdict: string | null;
  coverageState: string | null;
  indexingState: string | null;
  lastCrawlTime: string | null;
  pageFetchState: string | null;
  indexed: boolean;
};

export type UrlInspectionFull = UrlInspectionSummary & {
  inspectionResultLink: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  robotsTxtState: string | null;
  crawledAs: string | null;
  sitemaps: string[];
  referringUrls: string[];
};

type InspectApiResponse = {
  inspectionResult?: {
    inspectionResultLink?: string;
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      indexingState?: string;
      lastCrawlTime?: string;
      pageFetchState?: string;
      robotsTxtState?: string;
      googleCanonical?: string;
      userCanonical?: string;
      crawledAs?: string;
      sitemap?: string[];
      referringUrls?: string[];
    };
  };
  error?: { message?: string };
};

function mapInspectionResult(
  data: InspectApiResponse
): UrlInspectionFull | null {
  const idx = data.inspectionResult?.indexStatusResult;
  if (!idx) return null;

  const verdict = idx.verdict ?? null;

  return {
    verdict,
    coverageState: idx.coverageState ?? null,
    indexingState: idx.indexingState ?? null,
    lastCrawlTime: idx.lastCrawlTime ?? null,
    pageFetchState: idx.pageFetchState ?? null,
    indexed: verdict === "PASS",
    inspectionResultLink: data.inspectionResult?.inspectionResultLink ?? null,
    googleCanonical: idx.googleCanonical ?? null,
    userCanonical: idx.userCanonical ?? null,
    robotsTxtState: idx.robotsTxtState ?? null,
    crawledAs: idx.crawledAs ?? null,
    sitemaps: idx.sitemap ?? [],
    referringUrls: idx.referringUrls ?? [],
  };
}

export async function inspectUrlFull(
  accessToken: string,
  siteUrl: string,
  inspectionUrl: string
): Promise<{ inspection: UrlInspectionFull } | { error: string }> {
  const res = await fetch(INSPECT_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inspectionUrl,
      siteUrl,
      languageCode: "en-US",
    }),
  });

  const text = await res.text();
  let data: InspectApiResponse = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!res.ok) {
    return {
      error:
        data.error?.message ??
        `URL inspection failed (${res.status}).`,
    };
  }

  const inspection = mapInspectionResult(data);
  if (!inspection) {
    return { error: "No inspection data returned for this URL." };
  }

  return { inspection };
}

export async function inspectUrl(
  accessToken: string,
  siteUrl: string,
  inspectionUrl: string
): Promise<UrlInspectionSummary | null> {
  const result = await inspectUrlFull(accessToken, siteUrl, inspectionUrl);
  return "inspection" in result ? result.inspection : null;
}

const INSPECT_CONCURRENCY = 4;
const INSPECT_MAX_URLS = 30;

export async function inspectUrlsBatch(
  accessToken: string,
  siteUrl: string,
  urls: string[]
): Promise<Map<string, UrlInspectionSummary>> {
  const full = await inspectUrlsBatchFull(accessToken, siteUrl, urls);
  const results = new Map<string, UrlInspectionSummary>();
  for (const [url, inspection] of full) {
    results.set(url, inspection);
  }
  return results;
}

export async function inspectUrlsBatchFull(
  accessToken: string,
  siteUrl: string,
  urls: string[],
  maxUrls = INSPECT_MAX_URLS
): Promise<Map<string, UrlInspectionFull>> {
  const results = new Map<string, UrlInspectionFull>();
  const targets = urls.slice(0, maxUrls);

  let i = 0;
  async function worker() {
    while (i < targets.length) {
      const url = targets[i++];
      const result = await inspectUrlFull(accessToken, siteUrl, url);
      if ("inspection" in result) results.set(url, result.inspection);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(INSPECT_CONCURRENCY, targets.length) }, () =>
      worker()
    )
  );

  return results;
}
