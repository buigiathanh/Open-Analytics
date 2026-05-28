/** Normalize a user-entered URL for Search Console inspection. */
export function normalizeGscInspectionUrl(
  raw: string,
  siteDomain: string
): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(`https://${trimmed}`);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol)) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const domain = siteDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/^www\./, "");

  if (!domain) return null;

  const domainMatch =
    host === domain || host.endsWith(`.${domain}`) || domain.endsWith(`.${host}`);

  if (!domainMatch) return null;

  return url.toString();
}
