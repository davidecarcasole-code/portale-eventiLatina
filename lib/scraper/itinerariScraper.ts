import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.itinerarinellarte.it';
const FIRST = `${BASE}/it/eventi/latina`;

const CATEGORY_MAP: Record<string, string> = {
  'arte contemporanea': 'cultura',
  'musica': 'musica',
  'teatro': 'teatro',
  'danza': 'spettacolo',
  'performance': 'spettacolo',
  'cinema': 'spettacolo',
  'fotografia': 'cultura',
  'mostre': 'cultura',
  'fiere': 'spettacolo',
  'festival': 'spettacolo',
  'incontro': 'cultura',
  'convegno': 'cultura',
  'presentazione': 'cultura',
  'laboratorio': 'bambini',
  'visita guidata': 'cultura',
  'benessere': 'benessere',
  'yoga': 'benessere',
  'salute': 'salute',
  'donna': 'rosa',
};

function detectCategory(labels: string[]): string {
  for (const label of labels) {
    const lower = label.toLowerCase().trim();
    for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(key)) return slug;
    }
  }
  return 'cultura';
}

function parseItalianDate(str: string): string {
  const parts = str.trim().split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

function parseEvents(html: string): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];

  $('div.list-item').each((_, el) => {
    const $el = $(el);

    const h3 = $el.find('h3').first().text().trim();
    if (!h3) return;

    const desc = $el.find('p.abstract').first().text().trim();
    const imgEl = $el.find('figure.box-pic img').first();
    const imgSrc = imgEl.attr('src') || '';
    const imgUrl = imgSrc.startsWith('http') ? imgSrc : imgSrc.startsWith('/') ? `${BASE}${imgSrc}` : '';

    const dateSpans = $el.find('.eventi-data');
    let startDate = '';
    let endDate = '';
    if (dateSpans.length >= 1) {
      startDate = parseItalianDate($(dateSpans[0]).text());
    }
    if (dateSpans.length >= 2) {
      endDate = parseItalianDate($(dateSpans[1]).text());
    }

    const locationEl = $el.find('.eventi-date').filter((_, e) => $(e).find('ion-icon[name="map"]').length > 0);
    let location = '';
    if (locationEl.length > 0) {
      const txt = locationEl.text().replace('Lazio,', '').trim();
      const match = txt.match(/^([^,]+)/);
      if (match) location = match[1].trim();
    }

    const labels: string[] = [];
    $el.find('.categorie-labels a').each((_, a) => {
      const t = $(a).text().trim();
      if (t && !t.toLowerCase().includes('lazio') && !t.toLowerCase().includes('latina')) {
        labels.push(t);
      }
    });

    const hasEnded = $el.text().includes('evento concluso');

    if (hasEnded && startDate) {
      const d = new Date(startDate + 'T00:00:00Z');
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      if (d < yearAgo) return;
    }

    const category = detectCategory(labels);

    const link = $el.find('a[href*="/it/mostre/"], a[href*="/it/eventi/"]').first().attr('href') || '';
    const sourceUrl = link.startsWith('http') ? link : `${BASE}${link}`;

    events.push({
      title: h3,
      description: desc || undefined,
      date: startDate || new Date().toISOString().split('T')[0],
      end_date: endDate || undefined,
      city: location || 'Latina',
      province: 'LT',
      category_id: category,
      image_url: imgUrl || undefined,
      source_url: sourceUrl,
      source_name: 'Itinerari nell\'Arte',
    });
  });

  return events;
}

export async function runItinerariScraper(): Promise<ScrapedEvent[]> {
  console.log('[Itinerari] Fetching pages...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const processed = new Set<string>();

  const pageOffsets = [0, 10, 20, 30, 40, 50, 60, 70, 80];

  for (const offset of pageOffsets) {
    const url = offset === 0 ? FIRST : `${FIRST}?eventi_pg_from=${offset}`;
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      });
      const events = parseEvents(res.data);
      if (events.length === 0) break;

      let newCount = 0;
      for (const e of events) {
        const key = e.title.toLowerCase().slice(0, 60) + e.date + e.city;
        const urlKey = e.source_url || '';
        if (processed.has(urlKey)) continue;
        if (seen.has(key)) continue;
        processed.add(urlKey);
        seen.add(key);
        all.push(e);
        newCount++;
      }
      console.log(`[Itinerari] Page ${offset / 10 + 1}: ${events.length} events, ${newCount} new`);
    } catch (err: any) {
      console.error(`[Itinerari] Page ${offset / 10 + 1} error: ${err.message?.slice(0, 100)}`);
      break;
    }
  }

  console.log(`[Itinerari] Total: ${all.length} unique events`);
  return all;
}
