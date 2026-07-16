import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.tuttocampiestivi.com';
const LISTING = `${BASE}/it/campi-estivi-centro-italia/campi-estivi-lazio`;

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/campus|estivo|bambini|kids|giochi|ragazzi|famiglia/.test(lower)) return 'bambini';
  if (/sport|gara|calcio|basket|tennis|nuoto|atletica/.test(lower)) return 'sport';
  if (/natura|parco|riserva/.test(lower)) return 'natura';
  return 'bambini';
}

function parseItalianDate(dateStr: string): string {
  const year = new Date().getFullYear();
  const lower = dateStr.toLowerCase();
  for (const [monthName, monthNum] of Object.entries(MONTHS_IT)) {
    if (lower.includes(monthName)) {
      const dayMatch = lower.match(/(\d{1,2})/);
      const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
      return `${year}-${monthNum}-${day}`;
    }
  }
  return '';
}

export async function runTuttoCampiScraper(): Promise<ScrapedEvent[]> {
  console.log('[TuttoCampi] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  try {
    const res = await axios.get(LISTING, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);

    const cards = $('article, .camp-card, [class*="camp"], [class*="listing"], .card, .entry');
    cards.each((_, el) => {
      const $card = $(el);
      const title = $card.find('h2, h3, h4, .title, [class*="title"]').first().text().trim();
      if (!title || title.length < 5) return;

      const href = $card.find('a').first().attr('href') || '';
      const sourceUrl = href.startsWith('http') ? href : (href ? `${BASE}${href}` : LISTING);

      const text = $card.text().toLowerCase();
      if (!/latina| LT |pontino|circeo|sabaudia|terraccina/i.test($card.text())) return;

      const dateText = $card.find('time, [class*="date"], span').first().text().trim();
      const date = parseItalianDate(dateText) || new Date().toISOString().split('T')[0];

      const description = $card.find('p, .description, .excerpt').first().text().trim().substring(0, 500);
      const category = detectCategory(title + ' ' + (description || ''));

      const imgSrc = $card.find('img').first().attr('src') || '';
      const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

      const key = title.toLowerCase().slice(0, 60) + date;
      if (seen.has(key)) return;
      seen.add(key);

      all.push({
        title: title.substring(0, 200),
        description: description || undefined,
        date,
        city: 'Latina',
        province: 'LT',
        category_id: category,
        image_url: imageUrl,
        source_url: sourceUrl,
        source_name: 'TuttoCampiEstivi',
      });
    });

    console.log(`[TuttoCampi] Found ${all.length} camps`);
  } catch (err: any) {
    console.error(`[TuttoCampi] Error: ${err.message?.slice(0, 200)}`);
  }

  console.log(`[TuttoCampi] Total: ${all.length} events`);
  return all;
}
