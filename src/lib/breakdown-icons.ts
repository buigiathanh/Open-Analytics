import { BROWSER, DEVICE, PLATFORM } from "./constants";

/** Local Icons8 assets (see public/icons/). */
export const ICON_GLOBE = "/icons/globe.png";

/** DuckDuckGo favicon service (same approach as Umami). */
export function referrerFaviconUrl(host: string): string {
  const domain = host.replace(/^www\./, "").toLowerCase();
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
}

export function countryFlagUrl(code: string | null): string {
  if (!code || code.length !== 2 || code === "??") return ICON_GLOBE;
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

const BROWSER_ICON: Record<number, string> = {
  [BROWSER.CHROME]: "/icons/chrome.png",
  [BROWSER.FIREFOX]: "/icons/firefox.png",
  [BROWSER.SAFARI]: "/icons/safari.png",
  [BROWSER.EDGE]: "/icons/edge.png",
  [BROWSER.OPERA]: "/icons/opera.png",
  [BROWSER.SAMSUNG]: "/icons/samsung-internet.png",
  [BROWSER.UNKNOWN]: ICON_GLOBE,
};

const DEVICE_ICON: Record<number, string> = {
  [DEVICE.DESKTOP]: "/icons/desktop.png",
  [DEVICE.MOBILE]: "/icons/mobile.png",
  [DEVICE.TABLET]: "/icons/tablet.png",
  [DEVICE.TV]: "/icons/tv.png",
  [DEVICE.UNKNOWN]: ICON_GLOBE,
};

const PLATFORM_ICON: Record<number, string> = {
  [PLATFORM.WINDOWS]: "/icons/windows.png",
  [PLATFORM.MAC]: "/icons/macos.png",
  [PLATFORM.LINUX]: "/icons/linux.png",
  [PLATFORM.IOS]: "/icons/macos.png",
  [PLATFORM.ANDROID]: "/icons/android.png",
  [PLATFORM.CHROMEOS]: "/icons/chrome.png",
  [PLATFORM.UNKNOWN]: ICON_GLOBE,
};

/** Optional browsers detected via UA string (future tracker support). */
const BROWSER_LABEL_ICON: Record<string, string> = {
  Brave: "/icons/brave.png",
  Tor: "/icons/tor.png",
  "Coc Coc": "/icons/coc-coc.png",
};

export function browserIconUrl(code: number, label?: string): string {
  if (label && BROWSER_LABEL_ICON[label]) return BROWSER_LABEL_ICON[label];
  return BROWSER_ICON[code] ?? ICON_GLOBE;
}

export function deviceIconUrl(code: number): string {
  return DEVICE_ICON[code] ?? ICON_GLOBE;
}

export function platformIconUrl(code: number): string {
  return PLATFORM_ICON[code] ?? ICON_GLOBE;
}

export function channelIconUrl(referrer: string | null): string {
  if (!referrer?.trim()) return ICON_GLOBE;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host) return ICON_GLOBE;
    return referrerFaviconUrl(host);
  } catch {
    return ICON_GLOBE;
  }
}
