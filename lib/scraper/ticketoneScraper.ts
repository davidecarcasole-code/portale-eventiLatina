import axios from 'axios';
import { ScrapedEvent } from './scraped-event';

const BASE_URL = 'https://www.ticketone.it/cityd/latina-1347/';

const CATEGORY_MAP: Record<string, string> = {
  MusicEvent: 'musica',
  ComedyEvent: 'spettacolo',
  LiteraryEvent: 'cultura',
  TheatreEvent: 'teatro',
  DanceEvent: 'spettacolo',
  Festival: 'musica',
};

function detectCategory(eventType: string): string {
  return CATEGORY_MAP[eventType] || 'spettacolo';
}

function extractDate(isoStr: string): string {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}

function extractTime(isoStr: string): string | undefined {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return undefined;
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export async function runTicketoneScraper(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  try {
    const res = await axios.get(BASE_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EventiNLatinaBot/1.0)' },
      timeout: 20000,
    });

    const match = res.data.match(/<script id="eventMarkup" type="application\/ld\+json">(.*?)<\/script>/s);
    if (!match) {
      console.error('[TicketOne] No JSON-LD event markup found');
      return events;
    }

    let data: any;
    try { data = JSON.parse(match[1]); } catch {
      console.error('[TicketOne] Failed to parse JSON-LD');
      return events;
    }

    const list = data?.itemListElement;
    if (!Array.isArray(list)) {
      console.error('[TicketOne] No itemListElement in JSON-LD');
      return events;
    }

    for (const entry of list) {
      const item = entry?.item;
      if (!item?.name) continue;

      const title = item.name.trim();
      const dedupKey = title.toLowerCase().slice(0, 80);
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      const venue = item.location?.name || '';
      const cityRaw = item.location?.address?.addressLocality || '';
      const city = cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1).toLowerCase();

      const sourceUrl = item.offers?.url || item.url || '';
      const price = item.offers?.lowPrice || '';

      const category_id = detectCategory(item['@type'] || '');

      const location = venue ? (city ? `${venue}, ${city}` : venue) : city || 'Latina';

      events.push({
        title: title.slice(0, 200),
        description: price ? `Biglietti da €${price}` : undefined,
        date: extractDate(item.startDate),
        time: extractTime(item.startDate),
        location: location,
        city: city || 'Latina',
        category_id,
        source_url: sourceUrl,
        source_name: 'TicketOne',
      });
    }

    console.log(`[TicketOne] ${events.length} events found via JSON-LD`);
  } catch (err: any) {
    console.error(`[TicketOne] Error: ${err.message}`);
  }

  return events;
}
