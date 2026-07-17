import axios from 'axios';
import { ScrapedEvent } from './scraped-event';

const LISTING = 'https://www.eventbrite.it/d/italy--latina/health--events';

function detectCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('cinema') || text.includes('film') || text.includes('documentario') || text.includes('proiezione') || text.includes('rassegna') || text.includes('cinemateca') || text.includes('cineforum') || text.includes('pellicola') || text.includes('regista')) {
    return 'cinema';
  }
  if (text.includes('mare') || text.includes('spiaggia') || text.includes('lido') || text.includes('bagno') || text.includes('costa') || text.includes('litorale') || text.includes('sabbia') || text.includes('nuoto') || text.includes('vela') || text.includes('windsurf') || text.includes('kitesurf') || text.includes('sub') || text.includes('immersione') || text.includes('porto') || text.includes('approdo')) {
    return 'mare';
  }
  if (text.includes('circeo') || text.includes('sabaudia') || text.includes('terracina') || text.includes('formia') || text.includes('gaeta') || text.includes('san felice') || text.includes('santa marinella') || text.includes('sperlonga') || text.includes('pontina') || text.includes('torre')) {
    return 'mare';
  }
  if (text.includes('yoga') || text.includes('meditazione') || text.includes('mindfulness') ||
      text.includes('pilates') || text.includes('olistico') || text.includes('wellness') ||
      text.includes('detox') || text.includes('ritiro') || text.includes('spa') ||
      text.includes('benessere') || text.includes('massaggio') || text.includes('rilassamento')) {
    return 'benessere';
  }
  if (text.includes('medical') || text.includes('therapy') || text.includes('clinical') ||
      text.includes('surgery') || text.includes('medic') || text.includes('health') ||
      text.includes('conference') || text.includes('summit') || text.includes('symposium') ||
      text.includes('scientific') || text.includes('research')) {
    return 'salute';
  }
  if (text.includes('donna') || text.includes('femminile') || text.includes('women') ||
      text.includes('self defence') || text.includes('defence') || text.includes('rosa')) {
    return 'rosa';
  }
  if (text.includes('natura') || text.includes('trekking') || text.includes('outdoor') ||
      text.includes('camping') || text.includes('montagna') || text.includes('bosco')) {
    return 'natura';
  }
  return 'salute';
}

function extractReactQueryState(html: string): any[] {
  // Find the start of __REACT_QUERY_STATE__ assignment
  const marker = 'window.__REACT_QUERY_STATE__=';
  const marker2 = 'window.__REACT_QUERY_STATE__ =';
  let idx = html.indexOf(marker);
  if (idx === -1) idx = html.indexOf(marker2);
  if (idx === -1) return [];

  const start = html.indexOf('{', idx);
  if (start === -1) return [];

  // Count braces to find matching closing brace
  let depth = 0;
  let end = start;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (depth !== 0) return [];

  try {
    const data = JSON.parse(html.slice(start, end));
    const results: any[] = [];
    for (const query of data.queries || []) {
      const evts = query?.state?.data?.events?.results || [];
      results.push(...evts);
    }
    return results;
  } catch {
    return [];
  }
}

function extractJsonLd(html: string): any[] {
  const events: any[] = [];
  const regex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === 'ItemList' && data.itemListElement) {
        for (const item of data.itemListElement) {
          if (item['@type'] !== 'ListItem' || !item.item) continue;
          if (item.item['@type'] === 'Event') {
            events.push(item.item);
          }
        }
      }
    } catch {
      // skip
    }
  }
  return events;
}

function eventFromJsonLd(event: any): ScrapedEvent | null {
  const title = event.name;
  if (!title) return null;
  const startDate = event.startDate;
  if (!startDate) return null;

  const addr = event.location?.address || {};
  const addressLocality = addr.addressLocality || '';
  const streetAddress = addr.streetAddress || '';
  const venueName = event.location?.name || '';
  const city = addressLocality?.replace(/\s*\([^)]*\)\s*$/, '') || 'Latina';
  const date = startDate.split('T')[0];
  const description = event.description || '';

  let imageUrl = event.image || '';
  if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('//')) {
    imageUrl = `https:${imageUrl}`;
  }

  return {
    title: title.slice(0, 200),
    description: description?.slice(0, 2000) || undefined,
    date,
    end_date: event.endDate ? event.endDate.split('T')[0] : undefined,
    location: streetAddress || venueName || undefined,
    city: city || 'Latina',
    category_id: detectCategory(title, description),
    image_url: imageUrl || undefined,
    source_url: event.url || LISTING,
    source_name: 'Eventbrite',
  };
}

function eventFromReactQuery(ev: any): ScrapedEvent | null {
  const title = ev.name?.text || ev.name;
  if (!title) return null;
  const startDate = ev.start_date || ev.start?.date || ev.start?.local;
  if (!startDate) return null;

  const locality = ev.primary_venue?.address?.city || ev.venue?.address?.city || '';
  const street = ev.primary_venue?.address?.localized_address_display || '';
  const venueName = ev.primary_venue?.name || '';
  const city = locality || 'Latina';
  const date = startDate.split('T')[0];
  const description = ev.summary?.text || ev.description?.text || '';

  let imageUrl = ev.image?.url || ev.logo?.url || '';
  if (typeof ev.image === 'string') imageUrl = ev.image;

  return {
    title: title.slice(0, 200),
    description: description?.slice(0, 2000) || undefined,
    date,
    end_date: ev.end_date ? ev.end_date.split('T')[0] : undefined,
    time: ev.start_time || undefined,
    location: street || venueName || undefined,
    city: city || 'Latina',
    category_id: detectCategory(title, description),
    image_url: imageUrl || undefined,
    source_url: ev.url || ev.tickets_url || LISTING,
    source_name: 'Eventbrite',
  };
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      },
      timeout: 20000,
    });
    return res.data;
  } catch (err: any) {
    console.error(`[Eventbrite] Fetch error: ${err.message?.slice(0, 150)}`);
    return null;
  }
}

function extractNextPageUrl(html: string): string | null {
  const match = html.match(/<link\s+rel="next"\s+href="([^"]+)"/i);
  return match ? match[1] : null;
}

export async function runEventbriteScraper(): Promise<ScrapedEvent[]> {
  console.log('[Eventbrite] Fetching listing...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();

  const pagesToFetch = [LISTING];
  const fetched = new Set<string>();

  for (let i = 0; i < pagesToFetch.length && i < 3; i++) {
    const url = pagesToFetch[i];
    if (fetched.has(url)) continue;
    fetched.add(url);

    const html = await fetchPage(url);
    if (!html || html.length < 1000) {
      console.log(`[Eventbrite] Page ${i + 1}: empty response`);
      continue;
    }

    // Parse JSON-LD events
    const jsonldEvents = extractJsonLd(html);
    for (const ev of jsonldEvents) {
      const parsed = eventFromJsonLd(ev);
      if (!parsed) continue;
      const key = parsed.title.toLowerCase().slice(0, 60) + parsed.date + parsed.city;
      if (!seen.has(key)) {
        seen.add(key);
        all.push(parsed);
      }
    }

    // Parse React Query state for richer data
    const rqEvents = extractReactQueryState(html);
    for (const ev of rqEvents) {
      const parsed = eventFromReactQuery(ev);
      if (!parsed) continue;
      const key = parsed.title.toLowerCase().slice(0, 60) + parsed.date + parsed.city;
      if (!seen.has(key)) {
        seen.add(key);
        all.push(parsed);
      }
    }

    console.log(`[Eventbrite] Page ${i + 1}: ${jsonldEvents.length} JSON-LD + ${rqEvents.length} RQ = ${all.length} unique`);

    // Check for next page
    const nextUrl = extractNextPageUrl(html);
    if (nextUrl) {
      const absolute = nextUrl.startsWith('http') ? nextUrl : `https://www.eventbrite.it${nextUrl}`;
      if (!fetched.has(absolute)) {
        pagesToFetch.push(absolute);
      }
    }
  }

  console.log(`[Eventbrite] Total: ${all.length} unique events`);
  return all;
}
