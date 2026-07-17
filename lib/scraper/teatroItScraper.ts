import { ScrapedEvent } from "./scraped-event";

const BASE = "https://www.teatro.it/spettacoli/latina";

/** Flexible JSON-LD extraction: handles " and \' and no-quote type attr */
function extractJsonLd(html: string): any[] {
  const results: any[] = [];
  const regex = /<script[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed["@type"] === "ItemList" && Array.isArray(parsed.itemListElement)) {
        for (const item of parsed.itemListElement) {
          if (item.item?.["@type"] === "TheaterEvent") {
            results.push(item.item);
          }
        }
      }
    } catch { /* skip invalid JSON */ }
  }
  return results;
}

/** Fallback: parse event cards from rendered HTML using selector patterns */
function parseHtmlEvents(html: string): any[] {
  const results: any[] = [];
  // Find event card blocks: they contain a link with an img, a category label, title, description
  const cardRegex = /<a\s+href="([^"]+)"[^>]*>\s*<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[\s\S]*?<\/a>/gi;
  // Simpler approach: extract all structured data from the DOM-like HTML
  // Look for sections with event info
  const blocks = html.split(/(?=<div[^>]*class="[^"]*card[^"]*")/i);
  // Actually use a different approach: extract from known pattern
  // Find all <a> tags with event URLs
  const urlSet = new Set<string>();
  const linkRegex = /<a[^>]*href="(https:\/\/www\.teatro\.it\/spettacoli\/[^"\/]+\/[^"\/]+\/\d{4}-\d{4}\/[^"]+)"[^>]*>/gi;
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    urlSet.add(m[1]);
  }
  // Extract title from URL slug
  for (const url of urlSet) {
    const titleSlug = url.split("/").pop()?.replace(/-/g, " ") || "";
    if (titleSlug) {
      results.push({ url, titleSlug });
    }
  }
  return results;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}

function mapCategory(genre: string): string {
  const g = (genre || "").toLowerCase();
  if (g.includes("music") || g.includes("concerto")) return "cat_music";
  if (g.includes("comico") || g.includes("commedia")) return "cat_entertainment";
  if (g.includes("teatro") || g.includes("prosa") || g.includes("dramma")) return "cat_theater";
  if (g.includes("famiglia") || g.includes("bambini") || g.includes("family")) return "cat_kids";
  if (g.includes("danza") || g.includes("ballo")) return "cat_culture";
  if (g.includes("classica") || g.includes("lirica") || g.includes("opera")) return "cat_culture";
  if (g.includes("incontro culturale") || g.includes("extra")) return "cat_culture";
  if (g.includes("intrattenimento")) return "cat_entertainment";
  if (g.includes("musical") || g.includes("varietà")) return "cat_entertainment";
  return "cat_entertainment";
}

/** Fetch with browser-like headers and return { html, ok } */
async function fetchPage(url: string): Promise<{ html: string; ok: boolean }> {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en;q=0.5",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Referer": "https://www.teatro.it/",
  };
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    const html = await res.text();
    return { html, ok: res.ok && html.length > 10000 };
  } catch {
    return { html: "", ok: false };
  }
}

/** Parse TheaterEvent items from HTML (JSON-LD or HTML fallback) */
function parseEventsFromHtml(html: string): any[] {
  // Try JSON-LD extraction first
  let items = extractJsonLd(html);
  if (items.length > 0) return items;

  // Fallback: look for inline JSON data in script tags with event data
  const scriptRegex = /<script[^>]*>[\s\S]*?({[\s\S]*?"@type"\s*:\s*"TheaterEvent"[\s\S]*?})[\s\S]*?<\/script>/gi;
  let m;
  while ((m = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed["@type"] === "TheaterEvent") items.push(parsed);
    } catch { /* skip */ }
  }
  if (items.length > 0) return items;

  // Last resort: parse from rendered card structure
  return parseHtmlEvents(html);
}

export async function scrapeTeatroIt(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= 5; page++) {
    const urlsToTry = page === 1
      ? [`${BASE}?format=json`, `${BASE}`, `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(BASE)}&strip=1&vwsrc=0`]
      : [`${BASE}?format=json&page=${page}`, `${BASE}?page=${page}`, `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(`${BASE}?page=${page}`)}&strip=1&vwsrc=0`];
    let html = "", ok = false, usedUrl = "";
    for (const tryUrl of urlsToTry) {
      const result = await fetchPage(tryUrl);
      if (result.ok) { html = result.html; ok = true; usedUrl = tryUrl; break; }
    }
    if (!ok) {
      console.log(`[Teatro.it] All 3 fetch strategies failed for page ${page}`);
      break;
    }

    const items = parseEventsFromHtml(html);
    if (items.length === 0) {
      console.log(`[Teatro.it] No events found on page ${page}`);
      break;
    }

    for (const item of items) {
      const title = item.name?.trim();
      if (!title || seen.has(title)) continue;
      seen.add(title);

      const startDate = parseDate(item.startDate);
      if (!startDate) continue;

      const location = item.location || {};
      const venue = location.name || "";
      const address = location.address || {};
      const city = address.addressLocality || "";

      const description = item.description?.trim() || "";
      const image = item.image?.replace(/^https:\/\/www\.teatro\.it\/https:/, "https:") || "";
      const sourceUrl = item.url || usedUrl;

      const genre = item.performer?.["@type"] === "PerformingGroup"
        ? item.performer.name || ""
        : "";
      const category = mapCategory(genre);

      events.push({
        title,
        description: description || undefined,
        date: startDate,
        end_date: item.endDate ? parseDate(item.endDate) || undefined : undefined,
        location: venue || city || undefined,
        city,
        category_id: category,
        image_url: image || undefined,
        source_url: sourceUrl,
        source_name: "Teatro.it",
      });
    }

    if (items.length < 20) break;
  }

  console.log(`[Teatro.it] ${events.length} total events scraped`);
  return events;
}
