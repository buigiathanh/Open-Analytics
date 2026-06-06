import { BROWSER_LABEL, DEVICE_LABEL } from "./constants";
import { countryName, referrerHost } from "./countries";
import type { LiveFeedItem } from "./analytics";
import type { GlobeVisitor } from "./visitor-globe-data";

const COUNTRY_CENTER: Record<string, [number, number]> = {
  US: [39.8, -98.5],
  VN: [21.0, 105.8],
  GB: [55.4, -3.4],
  DE: [51.2, 10.5],
  FR: [46.2, 2.2],
  JP: [36.2, 138.3],
  IN: [20.6, 78.9],
  BR: [-14.2, -51.9],
  AU: [-25.3, 133.8],
  CN: [35.9, 104.2],
  SG: [1.35, 103.8],
  TH: [15.87, 100.99],
  KR: [36.5, 127.9],
};

export function liveFeedToGlobeVisitors(feed: LiveFeedItem[]): GlobeVisitor[] {
  const result: GlobeVisitor[] = [];

  for (const v of feed) {
    const code = (v.country_code || "").toUpperCase();
    const lat =
      v.latitude ?? (code ? COUNTRY_CENTER[code]?.[0] : null) ?? null;
    const lng =
      v.longitude ?? (code ? COUNTRY_CENTER[code]?.[1] : null) ?? null;
    if (lat == null || lng == null) continue;

    const country = countryName(v.country_code);
    const source =
      v.source?.trim() || referrerHost(v.referrer) || "Direct";

    result.push({
      id: v.visitor_id,
      name: v.path || "/",
      displayName: v.displayName,
      avatar: v.avatar,
      location: [lat, lng],
      city: "",
      country,
      countryCode: code.toLowerCase() || "xx",
      path: v.path || "/",
      deviceLabel: DEVICE_LABEL[v.device ?? 0],
      browserLabel: BROWSER_LABEL[v.browser ?? 0],
      source: v.isBot ? v.botLabel ?? "Bot" : source,
      lastSeen: v.last_seen,
      isBot: v.isBot,
    });
  }

  return result;
}
