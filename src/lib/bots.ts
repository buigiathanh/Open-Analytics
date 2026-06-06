/** Known crawlers — order matters (first match wins). */
export type BotId =
  | "google"
  | "bing"
  | "ahrefs"
  | "semrush"
  | "apple"
  | "chatgpt"
  | "claude"
  | "perplexity"
  | "mistral"
  | "deepseek"
  | "cohere"
  | "bytespider"
  | "commoncrawl"
  | "diffbot"
  | "you"
  | "firecrawl"
  | "meta"
  | "yandex"
  | "duckduckgo"
  | "linkedin"
  | "twitter"
  | "pinterest"
  | "baidu"
  | "amazon"
  | "other";

/** Featured bots — default chart visibility & table icon priority. */
export const PRIMARY_BOT_IDS: BotId[] = [
  "google",
  "bing",
  "chatgpt",
  "claude",
];

const MAX_VISIBLE_PAGE_BOTS = 4;

/** Local CEO portraits under public/bots/ceos/. */
export const BOT_CEO_AVATAR_DIR = "/bots/ceos";

function localCeoAvatar(id: string, ext: string): string {
  return `${BOT_CEO_AVATAR_DIR}/${id}.${ext}`;
}

export function partitionPageBots(botIds: BotId[]): {
  visible: BotId[];
  overflow: BotId[];
} {
  const set = new Set(botIds);
  const priority = PRIMARY_BOT_IDS.filter((id) => set.has(id));
  const rest = botIds.filter((id) => !PRIMARY_BOT_IDS.includes(id));
  const ordered = [...priority, ...rest];
  return {
    visible: ordered.slice(0, MAX_VISIBLE_PAGE_BOTS),
    overflow: ordered.slice(MAX_VISIBLE_PAGE_BOTS),
  };
}

export interface BotDefinition {
  id: BotId;
  label: string;
  /** Domain for favicon (DuckDuckGo ip3 service). */
  iconDomain: string;
  color: string;
  pattern: RegExp;
  /** Public face shown in realtime feed (CEO / founder). */
  ceoName: string;
  /** Portrait URL — local file under public/bots/ceos/. */
  ceoAvatar: string;
}

export const BOT_DEFINITIONS: BotDefinition[] = [
  {
    id: "google",
    label: "Google",
    iconDomain: "google.com",
    color: "#4285F4",
    pattern: /googlebot|google-inspectiontool|adsbot-google|mediapartners-google/i,
    ceoName: "Sundar Pichai",
    ceoAvatar: localCeoAvatar("google", "png"),
  },
  {
    id: "bing",
    label: "Bing / Copilot",
    iconDomain: "bing.com",
    color: "#008373",
    pattern: /bingbot|msnbot|bingpreview/i,
    ceoName: "Satya Nadella",
    ceoAvatar: localCeoAvatar("bing", "jpg"),
  },
  {
    id: "ahrefs",
    label: "Ahrefs",
    iconDomain: "ahrefs.com",
    color: "#FF7A59",
    pattern: /ahrefsbot/i,
    ceoName: "Dmytro Gerasymenko",
    ceoAvatar: localCeoAvatar("ahrefs", "jpg"),
  },
  {
    id: "semrush",
    label: "Semrush",
    iconDomain: "semrush.com",
    color: "#FF642D",
    pattern: /semrushbot/i,
    ceoName: "Oleg Shchegolev",
    ceoAvatar: localCeoAvatar("semrush", "jpg"),
  },
  {
    id: "apple",
    label: "Apple Intelligence",
    iconDomain: "apple.com",
    color: "#555555",
    pattern: /applebot/i,
    ceoName: "Tim Cook",
    ceoAvatar: localCeoAvatar("apple", "webp"),
  },
  {
    id: "chatgpt",
    label: "ChatGPT / OpenAI",
    iconDomain: "openai.com",
    color: "#10A37F",
    pattern: /gptbot|chatgpt-user|oai-searchbot/i,
    ceoName: "Sam Altman",
    ceoAvatar: localCeoAvatar("chatgpt", "jpg"),
  },
  {
    id: "claude",
    label: "Claude / Anthropic",
    iconDomain: "anthropic.com",
    color: "#D97757",
    pattern: /claudebot|claude-user|claude-searchbot|anthropic-ai/i,
    ceoName: "Dario Amodei",
    ceoAvatar: localCeoAvatar("claude", "jpg"),
  },
  {
    id: "perplexity",
    label: "Perplexity",
    iconDomain: "perplexity.ai",
    color: "#20B8CD",
    pattern: /perplexitybot|perplexity-user/i,
    ceoName: "Aravind Srinivas",
    ceoAvatar: localCeoAvatar("perplexity", "jpg"),
  },
  {
    id: "mistral",
    label: "Mistral",
    iconDomain: "mistral.ai",
    color: "#FA520A",
    pattern: /mistralai-user|mistralai-index/i,
    ceoName: "Arthur Mensch",
    ceoAvatar: localCeoAvatar("mistral", "jpg"),
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    iconDomain: "deepseek.com",
    color: "#4D6BFE",
    pattern: /deepseekbot/i,
    ceoName: "Liang Wenfeng",
    ceoAvatar: localCeoAvatar("deepseek", "png"),
  },
  {
    id: "cohere",
    label: "Cohere",
    iconDomain: "cohere.com",
    color: "#39594D",
    pattern: /cohere-ai|cohere-training-data-crawler/i,
    ceoName: "Aidan Gomez",
    ceoAvatar: localCeoAvatar("cohere", "jpg"),
  },
  {
    id: "bytespider",
    label: "ByteDance / Doubao",
    iconDomain: "bytedance.com",
    color: "#000000",
    pattern: /bytespider|bytedance/i,
    ceoName: "Liang Rubo",
    ceoAvatar: localCeoAvatar("bytespider", "jpg"),
  },
  {
    id: "commoncrawl",
    label: "Common Crawl",
    iconDomain: "commoncrawl.org",
    color: "#2E7D32",
    pattern: /ccbot/i,
    ceoName: "Mark Graham",
    ceoAvatar: localCeoAvatar("commoncrawl", "png"),
  },
  {
    id: "diffbot",
    label: "Diffbot",
    iconDomain: "diffbot.com",
    color: "#0066CC",
    pattern: /diffbot/i,
    ceoName: "Mike Tung",
    ceoAvatar: localCeoAvatar("diffbot", "jpg"),
  },
  {
    id: "you",
    label: "You.com",
    iconDomain: "you.com",
    color: "#6366F1",
    pattern: /youbot/i,
    ceoName: "Richard Socher",
    ceoAvatar: localCeoAvatar("you", "jpg"),
  },
  {
    id: "firecrawl",
    label: "Firecrawl",
    iconDomain: "firecrawl.dev",
    color: "#FF4F00",
    pattern: /firecrawlagent|firecrawl/i,
    ceoName: "Eric Ciarla",
    ceoAvatar: localCeoAvatar("firecrawl", "jpg"),
  },
  {
    id: "meta",
    label: "Meta AI",
    iconDomain: "meta.com",
    color: "#0866FF",
    pattern: /facebookexternalhit|facebookbot|meta-externalagent|meta-externalfetcher|facebot/i,
    ceoName: "Mark Zuckerberg",
    ceoAvatar: localCeoAvatar("meta", "png"),
  },
  {
    id: "yandex",
    label: "Yandex",
    iconDomain: "yandex.com",
    color: "#FC3F1D",
    pattern: /yandexbot|yandeximages/i,
    ceoName: "Arkady Volozh",
    ceoAvatar: localCeoAvatar("yandex", "jpg"),
  },
  {
    id: "duckduckgo",
    label: "DuckDuckGo",
    iconDomain: "duckduckgo.com",
    color: "#DE5833",
    pattern: /duckduckbot|duckassistbot/i,
    ceoName: "Gabriel Weinberg",
    ceoAvatar: localCeoAvatar("duckduckgo", "jpg"),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    iconDomain: "linkedin.com",
    color: "#0A66C2",
    pattern: /linkedinbot/i,
    ceoName: "Ryan Roslansky",
    ceoAvatar: localCeoAvatar("linkedin", "jpg"),
  },
  {
    id: "twitter",
    label: "X",
    iconDomain: "x.com",
    color: "#000000",
    pattern: /twitterbot/i,
    ceoName: "Elon Musk",
    ceoAvatar: localCeoAvatar("twitter", "png"),
  },
  {
    id: "pinterest",
    label: "Pinterest",
    iconDomain: "pinterest.com",
    color: "#E60023",
    pattern: /pinterestbot/i,
    ceoName: "Bill Ready",
    ceoAvatar: localCeoAvatar("pinterest", "png"),
  },
  {
    id: "baidu",
    label: "Baidu",
    iconDomain: "baidu.com",
    color: "#2319DC",
    pattern: /baiduspider/i,
    ceoName: "Robin Li",
    ceoAvatar: localCeoAvatar("baidu", "jpg"),
  },
  {
    id: "amazon",
    label: "Amazon / Alexa",
    iconDomain: "amazon.com",
    color: "#FF9900",
    pattern: /amazonbot|bedrockbot/i,
    ceoName: "Andy Jassy",
    ceoAvatar: localCeoAvatar("amazon", "jpg"),
  },
];

export const BOT_OTHER: BotDefinition = {
  id: "other",
  label: "Other",
  iconDomain: "",
  color: "#a1a1aa",
  pattern: /.*/,
  ceoName: "Unknown Crawler",
  ceoAvatar: "/icons/bot.png",
};

export function classifyBot(userAgent: string | null | undefined): BotId {
  const ua = userAgent?.trim() ?? "";
  if (!ua) return "other";
  for (const def of BOT_DEFINITIONS) {
    if (def.pattern.test(ua)) return def.id;
  }
  return "other";
}

const KNOWN_BOT_IDS = new Set<BotId>([
  ...BOT_DEFINITIONS.map((d) => d.id),
  "other",
]);

export function normalizeBotId(value: string | null | undefined): BotId {
  if (value && KNOWN_BOT_IDS.has(value as BotId)) {
    return value as BotId;
  }
  return "other";
}

export function getBotDefinition(id: BotId): BotDefinition {
  return BOT_DEFINITIONS.find((d) => d.id === id) ?? BOT_OTHER;
}

export const BOT_OTHER_ICON_URL = "/icons/bot.png";

export function botIconUrl(id: BotId): string {
  if (id === "other") return BOT_OTHER_ICON_URL;
  const def = getBotDefinition(id);
  if (!def.iconDomain) return "/icons/globe.png";
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(def.iconDomain)}.ico`;
}

/** CEO / founder identity for realtime bot feed rows. */
export function botCeoIdentity(id: BotId): { name: string; avatar: string } {
  const def = getBotDefinition(id);
  return { name: def.ceoName, avatar: def.ceoAvatar };
}

/** Loose client-side bot UA gate — server classifies and verifies bots. */
export const BOT_UA_BASIC_PATTERN =
  /bot|crawl|spider|slurp|preview|fetcher|archiver|httpclient|headless/i;

/** @deprecated Use BOT_UA_BASIC_PATTERN for client gates; server uses classifyBot(). */
export const BOT_UA_PATTERN = BOT_UA_BASIC_PATTERN;
