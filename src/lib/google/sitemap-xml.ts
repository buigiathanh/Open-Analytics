export type ParsedSitemapUrl = {
  loc: string;
  lastmod?: string;
};

const MAX_URLS_DEFAULT = 500;
const MAX_SITEMAP_FETCHES = 40;

function extractUrlEntries(xml: string): ParsedSitemapUrl[] {
  const entries: ParsedSitemapUrl[] = [];
  const urlBlockRe = /<url\b[^>]*>([\s\S]*?)<\/url>/gi;
  let block: RegExpExecArray | null;
  while ((block = urlBlockRe.exec(xml)) !== null) {
    const chunk = block[1];
    const loc = /<loc>\s*([^<]+?)\s*<\/loc>/i.exec(chunk)?.[1]?.trim();
    if (!loc) continue;
    const lastmod = /<lastmod>\s*([^<]+?)\s*<\/lastmod>/i.exec(chunk)?.[1]?.trim();
    entries.push(lastmod ? { loc, lastmod } : { loc });
  }
  return entries;
}

function extractSitemapIndexLocs(xml: string): string[] {
  const locs: string[] = [];
  const re = /<sitemap\b[^>]*>[\s\S]*?<loc>\s*([^<]+?)\s*<\/loc>[\s\S]*?<\/sitemap>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    locs.push(m[1].trim());
  }
  if (locs.length > 0) return locs;
  const fallback = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  while ((m = fallback.exec(xml))) {
    locs.push(m[1].trim());
  }
  return locs;
}

function isSitemapIndexXml(xml: string): boolean {
  return /<sitemapindex\b/i.test(xml);
}

async function fetchXml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: "application/xml,text/xml,*/*" },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`Could not fetch sitemap (${res.status})`);
  }
  return res.text();
}

/**
 * Fetches a sitemap (or sitemap index) and returns page URLs up to maxUrls.
 */
export async function fetchSitemapUrls(
  feedpath: string,
  maxUrls = MAX_URLS_DEFAULT
): Promise<{ urls: ParsedSitemapUrl[]; truncated: boolean }> {
  const seenFeeds = new Set<string>();
  const urlSeen = new Set<string>();
  const urls: ParsedSitemapUrl[] = [];
  const queue: string[] = [feedpath];
  let truncated = false;

  while (queue.length > 0 && urls.length < maxUrls) {
    const feed = queue.shift()!;
    if (seenFeeds.has(feed) || seenFeeds.size >= MAX_SITEMAP_FETCHES) continue;
    seenFeeds.add(feed);

    const xml = await fetchXml(feed);
    if (isSitemapIndexXml(xml)) {
      for (const child of extractSitemapIndexLocs(xml)) {
        if (urls.length >= maxUrls) {
          truncated = true;
          break;
        }
        if (!seenFeeds.has(child)) queue.push(child);
      }
      continue;
    }

    for (const entry of extractUrlEntries(xml)) {
      if (urlSeen.has(entry.loc)) continue;
      urlSeen.add(entry.loc);
      urls.push(entry);
      if (urls.length >= maxUrls) {
        truncated = true;
        break;
      }
    }
  }

  if (queue.length > 0 && urls.length >= maxUrls) truncated = true;

  return { urls, truncated };
}
