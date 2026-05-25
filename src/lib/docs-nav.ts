export type DocsNavItem = {
  title: string;
  href: string;
  description?: string;
};

export const DOCS_NAV: DocsNavItem[] = [
  { title: "Introduction", href: "/docs", description: "Overview and architecture" },
  { title: "Installation", href: "/docs/installation", description: "Run the dashboard locally" },
  { title: "Sign-in setup", href: "/docs/auth", description: "Google & GitHub OAuth" },
  { title: "Supabase setup", href: "/docs/supabase", description: "Registry and per-site projects" },
  { title: "Tracking script", href: "/docs/tracker", description: "Embed, options, and API" },
  { title: "Metrics", href: "/docs/metrics", description: "How numbers are calculated" },
  { title: "Dashboard", href: "/docs/dashboard", description: "Stats, breakdowns, realtime" },
  { title: "Security", href: "/docs/security", description: "Production hardening" },
];

export function docsTitle(segment: string): string {
  const item = DOCS_NAV.find((n) => n.href === segment || n.href === `/docs/${segment}`);
  return item?.title ?? "Documentation";
}
