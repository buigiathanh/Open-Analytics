/** Classify acquisition channel (Umami-style grouping). */

export interface ChannelInput {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer?: string | null;
  source?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  msclkid?: string | null;
}

const SEARCH_MATCH = [
  "google.",
  "bing.",
  "yahoo.",
  "duckduckgo.",
  "baidu.",
  "yandex.",
  "ecosia.",
  "brave.",
  "chatgpt.",
  "perplexity.",
];

const SOCIAL_MATCH = [
  "facebook.",
  "fb.com",
  "instagram.",
  "ig.com",
  "twitter.",
  "x.com",
  "t.co",
  "linkedin.",
  "reddit.",
  "pinterest.",
  "tiktok.",
  "snapchat.",
  "threads.net",
  "bsky.app",
];

const PAID_MEDIUM = /^(cpc|ppc|paid|paid_social|display|retargeting)$/i;

function hostFromReferrer(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function matchesAny(host: string, patterns: string[]): boolean {
  return patterns.some((p) => host.includes(p));
}

export function classifyChannel(input: ChannelInput): string {
  const utmSource = input.utm_source?.trim().toLowerCase();
  const utmMedium = input.utm_medium?.trim().toLowerCase();
  const refHost = hostFromReferrer(input.referrer ?? null);

  if (input.gclid || input.msclkid) return "Paid Search";
  if (input.fbclid) return "Paid Social";

  if (utmMedium && PAID_MEDIUM.test(utmMedium)) {
    if (utmSource) {
      const label = utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
      return `Paid · ${label}`;
    }
    return "Paid";
  }

  if (utmSource) {
    const label =
      utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
    if (utmMedium === "email") return `Email · ${label}`;
    if (utmMedium === "social") return `Social · ${label}`;
    return `Campaign · ${label}`;
  }

  if (refHost) {
    if (matchesAny(refHost, SEARCH_MATCH)) return "Organic Search";
    if (matchesAny(refHost, SOCIAL_MATCH)) return "Social";
    return refHost;
  }

  const src = input.source?.trim().toLowerCase();
  if (!src || src === "direct") return "Direct / None";

  if (matchesAny(src, SEARCH_MATCH)) return "Organic Search";
  if (matchesAny(src, SOCIAL_MATCH)) return "Social";

  return input.source!.slice(0, 80);
}
