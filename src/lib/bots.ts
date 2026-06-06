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
}

export const BOT_DEFINITIONS: BotDefinition[] = [
  {
    id: "google",
    label: "Google",
    iconDomain: "google.com",
    color: "#4285F4",
    pattern: /googlebot|google-inspectiontool|adsbot-google|mediapartners-google/i,
  },
  {
    id: "bing",
    label: "Bing / Copilot",
    iconDomain: "bing.com",
    color: "#008373",
    pattern: /bingbot|msnbot|bingpreview/i,
  },
  {
    id: "ahrefs",
    label: "Ahrefs",
    iconDomain: "ahrefs.com",
    color: "#FF7A59",
    pattern: /ahrefsbot/i,
  },
  {
    id: "semrush",
    label: "Semrush",
    iconDomain: "semrush.com",
    color: "#FF642D",
    pattern: /semrushbot/i,
  },
  {
    id: "apple",
    label: "Apple Intelligence",
    iconDomain: "apple.com",
    color: "#555555",
    pattern: /applebot/i,
  },
  {
    id: "chatgpt",
    label: "ChatGPT / OpenAI",
    iconDomain: "openai.com",
    color: "#10A37F",
    pattern: /gptbot|chatgpt-user|oai-searchbot/i,
  },
  {
    id: "claude",
    label: "Claude / Anthropic",
    iconDomain: "anthropic.com",
    color: "#D97757",
    pattern: /claudebot|claude-user|claude-searchbot|anthropic-ai/i,
  },
  {
    id: "perplexity",
    label: "Perplexity",
    iconDomain: "perplexity.ai",
    color: "#20B8CD",
    pattern: /perplexitybot|perplexity-user/i,
  },
  {
    id: "mistral",
    label: "Mistral",
    iconDomain: "mistral.ai",
    color: "#FA520A",
    pattern: /mistralai-user|mistralai-index/i,
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    iconDomain: "deepseek.com",
    color: "#4D6BFE",
    pattern: /deepseekbot/i,
  },
  {
    id: "cohere",
    label: "Cohere",
    iconDomain: "cohere.com",
    color: "#39594D",
    pattern: /cohere-ai|cohere-training-data-crawler/i,
  },
  {
    id: "bytespider",
    label: "ByteDance / Doubao",
    iconDomain: "bytedance.com",
    color: "#000000",
    pattern: /bytespider|bytedance/i,
  },
  {
    id: "commoncrawl",
    label: "Common Crawl",
    iconDomain: "commoncrawl.org",
    color: "#2E7D32",
    pattern: /ccbot/i,
  },
  {
    id: "diffbot",
    label: "Diffbot",
    iconDomain: "diffbot.com",
    color: "#0066CC",
    pattern: /diffbot/i,
  },
  {
    id: "you",
    label: "You.com",
    iconDomain: "you.com",
    color: "#6366F1",
    pattern: /youbot/i,
  },
  {
    id: "firecrawl",
    label: "Firecrawl",
    iconDomain: "firecrawl.dev",
    color: "#FF4F00",
    pattern: /firecrawlagent|firecrawl/i,
  },
  {
    id: "meta",
    label: "Meta AI",
    iconDomain: "meta.com",
    color: "#0866FF",
    pattern: /facebookexternalhit|facebookbot|meta-externalagent|meta-externalfetcher|facebot/i,
  },
  {
    id: "yandex",
    label: "Yandex",
    iconDomain: "yandex.com",
    color: "#FC3F1D",
    pattern: /yandexbot|yandeximages/i,
  },
  {
    id: "duckduckgo",
    label: "DuckDuckGo",
    iconDomain: "duckduckgo.com",
    color: "#DE5833",
    pattern: /duckduckbot|duckassistbot/i,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    iconDomain: "linkedin.com",
    color: "#0A66C2",
    pattern: /linkedinbot/i,
  },
  {
    id: "twitter",
    label: "X",
    iconDomain: "x.com",
    color: "#000000",
    pattern: /twitterbot/i,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    iconDomain: "pinterest.com",
    color: "#E60023",
    pattern: /pinterestbot/i,
  },
  {
    id: "baidu",
    label: "Baidu",
    iconDomain: "baidu.com",
    color: "#2319DC",
    pattern: /baiduspider/i,
  },
  {
    id: "amazon",
    label: "Amazon / Alexa",
    iconDomain: "amazon.com",
    color: "#FF9900",
    pattern: /amazonbot|bedrockbot/i,
  },
];

export const BOT_OTHER: BotDefinition = {
  id: "other",
  label: "Other",
  iconDomain: "",
  color: "#a1a1aa",
  pattern: /.*/,
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

export function botIconUrl(id: BotId): string {
  const def = getBotDefinition(id);
  if (!def.iconDomain) return "/icons/globe.png";
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(def.iconDomain)}.ico`;
}

/** Loose client-side bot UA gate — server classifies and verifies bots. */
export const BOT_UA_BASIC_PATTERN =
  /bot|crawl|spider|slurp|preview|fetcher|archiver|httpclient|headless/i;

/** @deprecated Use BOT_UA_BASIC_PATTERN for client gates; server uses classifyBot(). */
export const BOT_UA_PATTERN = BOT_UA_BASIC_PATTERN;
