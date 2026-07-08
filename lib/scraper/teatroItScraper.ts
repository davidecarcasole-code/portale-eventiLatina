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

export async function scrapeTeatroIt(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= 5; page++) {
    const url = page === 1 ? `${BASE}?format=json` : `${BASE}?format=json&page=${page}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) break;

    const html = await res.text();

    // Try JSON-LD extraction first
    const items = extractJsonLd(html);

    // Fallback: parse from rendered HTML
    if (items.length === 0) {
      // Fallback approach: use schema.org JSON that might be rendered differently
      // Or parse from the visible card structure
      continue;
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
      const sourceUrl = item.url || url;

      // Use performer name OR category from schema; map to our categories
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
        province: "LT",
        category_id: category,
        image_url: image || undefined,
        source_url: sourceUrl,
        source_name: "Teatro.it",
      });
    }

    // If fewer items than expected, stop pagination
    if (items.length < 20) break;
  }

  return events;
}
