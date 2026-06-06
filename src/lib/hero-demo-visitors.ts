import type { GlobeVisitor } from "@/lib/visitor-globe-data";
import { visitorAvatarUrl, visitorDisplayName } from "@/lib/visitor-identity";

function demoVisitor(
  id: string,
  location: [number, number],
  country: string,
  countryCode: string,
  path: string,
  source: string,
  deviceLabel: string,
  browserLabel: string
): GlobeVisitor {
  return {
    id,
    name: path,
    displayName: visitorDisplayName(id),
    avatar: visitorAvatarUrl(id),
    location,
    city: "",
    country,
    countryCode,
    path,
    deviceLabel,
    browserLabel,
    source,
    lastSeen: new Date().toISOString(),
  };
}

/** Static demo visitors for marketing hero globe preview. */
export const HERO_DEMO_VISITORS: GlobeVisitor[] = [
  demoVisitor(
    "hero-demo-us",
    [37.7749, -122.4194],
    "United States",
    "us",
    "/pricing",
    "Google",
    "Desktop",
    "Chrome"
  ),
  demoVisitor(
    "hero-demo-gb",
    [51.5074, -0.1278],
    "United Kingdom",
    "gb",
    "/docs",
    "Direct",
    "Desktop",
    "Safari"
  ),
  demoVisitor(
    "hero-demo-jp",
    [35.6762, 139.6503],
    "Japan",
    "jp",
    "/",
    "GitHub",
    "Mobile",
    "Chrome"
  ),
  demoVisitor(
    "hero-demo-vn",
    [21.0285, 105.8542],
    "Vietnam",
    "vn",
    "/app",
    "Direct",
    "Desktop",
    "Edge"
  ),
  demoVisitor(
    "hero-demo-de",
    [52.52, 13.405],
    "Germany",
    "de",
    "/features",
    "Newsletter",
    "Desktop",
    "Firefox"
  ),
  demoVisitor(
    "hero-demo-br",
    [-23.5505, -46.6333],
    "Brazil",
    "br",
    "/blog",
    "Twitter/X",
    "Mobile",
    "Chrome"
  ),
  demoVisitor(
    "hero-demo-au",
    [-33.8688, 151.2093],
    "Australia",
    "au",
    "/share",
    "Product Hunt",
    "Tablet",
    "Safari"
  ),
  demoVisitor(
    "hero-demo-sg",
    [1.3521, 103.8198],
    "Singapore",
    "sg",
    "/docs/installation",
    "Google",
    "Desktop",
    "Chrome"
  ),
];
