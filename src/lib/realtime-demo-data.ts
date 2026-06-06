import { BOT_DEFINITIONS, type BotId } from "./bots";
import { BROWSER, DEVICE, EVENT_TYPE } from "./constants";
import type { AnalyticsEvent, BotVisit } from "./types";

type DemoVisitor = {
  visitorId: string;
  path: string;
  country: string;
  lat: number;
  lng: number;
  source: string;
  referrer: string | null;
  device: number;
  browser: number;
  agoMs: number;
};

const DEMO_VISITORS: DemoVisitor[] = [
  {
    visitorId: "demo-vn-hanoi",
    path: "/",
    country: "VN",
    lat: 21.0285,
    lng: 105.8542,
    source: "Direct",
    referrer: null,
    device: DEVICE.DESKTOP,
    browser: BROWSER.CHROME,
    agoMs: 12_000,
  },
  {
    visitorId: "demo-us-sf",
    path: "/pricing",
    country: "US",
    lat: 37.7749,
    lng: -122.4194,
    source: "Google",
    referrer: "https://www.google.com/",
    device: DEVICE.DESKTOP,
    browser: BROWSER.CHROME,
    agoMs: 45_000,
  },
  {
    visitorId: "demo-gb-london",
    path: "/docs",
    country: "GB",
    lat: 51.5074,
    lng: -0.1278,
    source: "GitHub",
    referrer: "https://github.com/",
    device: DEVICE.DESKTOP,
    browser: BROWSER.FIREFOX,
    agoMs: 78_000,
  },
  {
    visitorId: "demo-jp-tokyo",
    path: "/features",
    country: "JP",
    lat: 35.6762,
    lng: 139.6503,
    source: "Direct",
    referrer: null,
    device: DEVICE.MOBILE,
    browser: BROWSER.SAFARI,
    agoMs: 105_000,
  },
  {
    visitorId: "demo-de-berlin",
    path: "/blog/launch",
    country: "DE",
    lat: 52.52,
    lng: 13.405,
    source: "Newsletter",
    referrer: "https://mail.google.com/",
    device: DEVICE.DESKTOP,
    browser: BROWSER.EDGE,
    agoMs: 132_000,
  },
  {
    visitorId: "demo-br-sp",
    path: "/app",
    country: "BR",
    lat: -23.5505,
    lng: -46.6333,
    source: "Twitter/X",
    referrer: "https://x.com/",
    device: DEVICE.MOBILE,
    browser: BROWSER.CHROME,
    agoMs: 158_000,
  },
  {
    visitorId: "demo-au-sydney",
    path: "/share",
    country: "AU",
    lat: -33.8688,
    lng: 151.2093,
    source: "Product Hunt",
    referrer: "https://www.producthunt.com/",
    device: DEVICE.TABLET,
    browser: BROWSER.SAFARI,
    agoMs: 186_000,
  },
  {
    visitorId: "demo-sg",
    path: "/docs/installation",
    country: "SG",
    lat: 1.3521,
    lng: 103.8198,
    source: "Google",
    referrer: "https://www.google.com/search?q=open+analytics",
    device: DEVICE.DESKTOP,
    browser: BROWSER.CHROME,
    agoMs: 214_000,
  },
  {
    visitorId: "demo-fr-paris",
    path: "/changelog",
    country: "FR",
    lat: 48.8566,
    lng: 2.3522,
    source: "LinkedIn",
    referrer: "https://www.linkedin.com/",
    device: DEVICE.DESKTOP,
    browser: BROWSER.CHROME,
    agoMs: 242_000,
  },
  {
    visitorId: "demo-in-mumbai",
    path: "/",
    country: "IN",
    lat: 19.076,
    lng: 72.8777,
    source: "Direct",
    referrer: null,
    device: DEVICE.MOBILE,
    browser: BROWSER.CHROME,
    agoMs: 268_000,
  },
];

const DEMO_BOT_VISITS: { botId: BotId; path: string; agoMs: number }[] = [
  { botId: "google", path: "/", agoMs: 8_000 },
  { botId: "chatgpt", path: "/docs", agoMs: 22_000 },
  { botId: "claude", path: "/pricing", agoMs: 38_000 },
  { botId: "bing", path: "/blog", agoMs: 55_000 },
  { botId: "perplexity", path: "/features", agoMs: 72_000 },
  { botId: "meta", path: "/", agoMs: 95_000 },
  { botId: "apple", path: "/sitemap.xml", agoMs: 118_000 },
  { botId: "amazon", path: "/robots.txt", agoMs: 145_000 },
];

const LIVE_DEMO_PATHS = [
  "/",
  "/pricing",
  "/docs",
  "/features",
  "/blog",
  "/app",
  "/changelog",
];

const LIVE_DEMO_BOTS: BotId[] = [
  "google",
  "chatgpt",
  "claude",
  "bing",
  "perplexity",
  "mistral",
  "meta",
];

const LIVE_DEMO_VISITOR_POOL = DEMO_VISITORS;

let demoEventId = 900_000;
let demoBotVisitId = 800_000;

function agoIso(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

function botUa(botId: BotId): string {
  const def = BOT_DEFINITIONS.find((d) => d.id === botId);
  return def
    ? `Mozilla/5.0 (compatible; ${def.label} DemoBot/1.0)`
    : "Mozilla/5.0 (compatible; DemoBot/1.0)";
}

function makeEvent(siteKey: string, v: DemoVisitor, id: number): AnalyticsEvent {
  return {
    id,
    site_key: siteKey,
    visitor_id: v.visitorId,
    session_id: `demo-sess-${v.visitorId}`,
    visit_id: `demo-visit-${v.visitorId}`,
    event_type: EVENT_TYPE.PAGEVIEW,
    path: v.path,
    page_title: null,
    hostname: null,
    url_query: null,
    referrer: v.referrer,
    source: v.source,
    device: v.device,
    platform: null,
    browser: v.browser,
    country_code: v.country,
    latitude: v.lat,
    longitude: v.lng,
    duration_ms: null,
    language: "en",
    screen: null,
    distinct_id: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    gclid: null,
    fbclid: null,
    msclkid: null,
    event_name: null,
    created_at: agoIso(v.agoMs),
  };
}

function makeBotVisit(
  siteKey: string,
  botId: BotId,
  path: string,
  id: number,
  agoMs: number
): BotVisit {
  return {
    id,
    site_key: siteKey,
    bot_id: botId,
    user_agent: botUa(botId),
    path,
    ip: "203.0.113.10",
    created_at: agoIso(agoMs),
  };
}

export function getDemoRealtimeEvents(siteKey: string): AnalyticsEvent[] {
  return DEMO_VISITORS.map((v, i) => makeEvent(siteKey, v, 900_001 + i)).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getDemoRealtimeBotVisits(siteKey: string): BotVisit[] {
  return DEMO_BOT_VISITS.map((v, i) =>
    makeBotVisit(siteKey, v.botId, v.path, 800_001 + i, v.agoMs)
  ).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/** Random new human pageview for live demo ticks. */
export function nextDemoRealtimeEvent(siteKey: string): AnalyticsEvent {
  demoEventId += 1;
  const v =
    LIVE_DEMO_VISITOR_POOL[
      Math.floor(Math.random() * LIVE_DEMO_VISITOR_POOL.length)
    ];
  const path =
    LIVE_DEMO_PATHS[Math.floor(Math.random() * LIVE_DEMO_PATHS.length)];
  return makeEvent(
    siteKey,
    { ...v, path, agoMs: 0 },
    demoEventId
  );
}

/** Random new bot visit for live demo ticks. */
export function nextDemoRealtimeBotVisit(siteKey: string): BotVisit {
  demoBotVisitId += 1;
  const botId =
    LIVE_DEMO_BOTS[Math.floor(Math.random() * LIVE_DEMO_BOTS.length)];
  const path =
    LIVE_DEMO_PATHS[Math.floor(Math.random() * LIVE_DEMO_PATHS.length)];
  return makeBotVisit(siteKey, botId, path, demoBotVisitId, 0);
}
