/** App runtime mode — set APP_ENV=development|production in .env */
export function isDevMode(): boolean {
  const raw = process.env.APP_ENV?.trim().toLowerCase();
  if (raw === "development" || raw === "dev") return true;
  if (raw === "production" || raw === "prod") return false;
  return process.env.NODE_ENV !== "production";
}

export function isLocalhostHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "").split(":")[0] ?? "";
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host === "::1" ||
    host.endsWith(".localhost")
  );
}

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "")
    .split(":")[0] ?? "";
}

/** Whether an event hostname belongs to the registered project domain. */
export function hostnameMatchesProjectDomain(
  hostname: string,
  projectDomain: string
): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "").split(":")[0] ?? "";
  const domain = normalizeDomain(projectDomain);

  if (!host || !domain) return false;
  if (host === domain || host.endsWith(`.${domain}`)) return true;

  if (isDevMode() && isLocalhostHost(host)) return true;

  return false;
}

export function normalizeProbeSiteUrl(domain: string): string {
  const trimmed = domain.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const host = normalizeDomain(trimmed);
  const portMatch = trimmed.match(/:(\d+)$/);
  const port = portMatch ? `:${portMatch[1]}` : "";

  if (isDevMode() && isLocalhostHost(host)) {
    return `http://${host}${port}`;
  }

  return `https://${trimmed}`;
}
