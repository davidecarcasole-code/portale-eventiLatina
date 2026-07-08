import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.comune.latina.it';
const LISTING = `${BASE}/home/vivere/eventi.html`;
const API_RENDERED = `${BASE}/.rest/kibernetes/v1/eventi/rendered`;
const API_ARCHIVED = `${BASE}/.rest/kibernetes/v1/eventi/archiviati/rendered`;

const MONTHS: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

const CATEGORY_MAP: Record<string, string> = {
  'evento culturale': 'cultura',
  'manifestazione musicale': 'musica',
  'eventi sociali': 'spettacolo',
  'incontro con esperti': 'cultura',
  'mostra': 'cultura',
  'convegno': 'cultura',
  'concerto': 'musica',
  'teatro': 'teatro',
  'sport': 'sport',
  'bambini': 'bambini',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase().trim();
  for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return slug;
  }
  return 'spettacolo';
}

function parseDate(day: string, month: string, year: string): string {
  const m = MONTHS[month.toLowerCase().trim()];
  if (!m) return '';
  return `${year.trim()}-${m}-${day.trim().padStart(2, '0')}`;
}

function parseEventCard($el: cheerio.Cheerio, $: cheerio.Root): ScrapedEvent | null {
  const title = $el.find('h3.cmp-list-card-img__body-title a').first().text().trim();
  if (!title) return null;

  const link = $el.find('h3.cmp-list-card-img__body-title a').first().attr('href') || '';
  const day = $el.find('span.card-date').first().text().trim();
  const month = $el.find('span.card-day').first().text().trim();
  const year = $el.find('span.card-day').last().text().trim();
  const categoryText = $el.find('div.category-top span').first().text().trim();
  const description = $el.find('p.card-text').first().text().trim();
  const imgSrc = $el.find('figure.img-wrapper img').first().attr('src') || '';

  const dateStr = parseDate(day, month, year);
  if (!dateStr) return null;

  const category = detectCategory(categoryText || title);
  const sourceUrl = link.startsWith('http') ? link : `${BASE}${link}`;

  return {
    title,
    description: description || undefined,
    date: dateStr,
    city: 'Latina',
    province: 'LT',
    category_id: category,
    image_url: imgSrc.startsWith('http') ? imgSrc : `${BASE}${imgSrc}`,
    source_url: sourceUrl,
    source_name: 'Comune di Latina',
  };
}

function parseEvents(html: string): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  $('div.evenCard').each((_, el) => {
    const e = parseEventCard($(el), $);
    if (e) {
      const key = e.title.toLowerCase().slice(0, 60) + e.date + e.city;
      if (!seen.has(key)) {
        seen.add(key);
        events.push(e);
      }
    }
  });

  return events;
}

export async function runComuneLatinaScraper(): Promise<ScrapedEvent[]> {
  console.log('[ComuneLatina] Fetching listing...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();

  try {
    const res = await axios.get(LISTING, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    });
    const events = parseEvents(res.data);
    for (const e of events) {
      const key = e.title.toLowerCase().slice(0, 60) + e.date + e.city;
      if (!seen.has(key)) { seen.add(key); all.push(e); }
    }
    console.log(`[ComuneLatina] ${events.length} events from listing`);
  } catch (err: any) {
    console.error(`[ComuneLatina] Listing error: ${err.message?.slice(0, 100)}`);
  }

  try {
    for (let page = 0; page < 20; page++) {
      const res = await axios.get(API_ARCHIVED, {
        params: { page },
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      });
      const html = res.data;
      if (typeof html !== 'string' || html.trim().length < 50) break;

      const events = parseEvents(html);
      if (events.length === 0) break;

      let newCount = 0;
      for (const e of events) {
        const key = e.title.toLowerCase().slice(0, 60) + e.date + e.city;
        if (!seen.has(key)) { seen.add(key); all.push(e); newCount++; }
      }
      console.log(`[ComuneLatina] Archived page ${page}: ${events.length} events, ${newCount} new`);
    }
  } catch (err: any) {
    console.error(`[ComuneLatina] Archived error: ${err.message?.slice(0, 100)}`);
  }

  console.log(`[ComuneLatina] Total: ${all.length} unique events`);
  return all;
}
