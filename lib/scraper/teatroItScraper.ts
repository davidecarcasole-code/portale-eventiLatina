import { ScrapedEvent } from "./scraped-event";

const BASE = "https://www.teatro.it/spettacoli/latina";

function extractJsonLd(html: string): any[] {
  const results: any[] = [];
  const regex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g;
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
    } catch { /* skip invalid JSON blocks */ }
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

  for (let page = 1; page <= 10; page++) {
    const url = page === 1 ? BASE : `${BASE}?page=${page}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; EventiLatinaBot/1.0)" },
    });
    if (!res.ok) break;

    const html = await res.text();
    const items = extractJsonLd(html);
    if (items.length === 0) break;

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

      const genre = item.performer?.name || "";
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
  }

  return events;
}
