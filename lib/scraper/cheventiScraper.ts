import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.cheventi.it';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

const CATEGORY_MAP: Record<string, string> = {
  concerti: 'musica', musica: 'musica', live: 'musica',
  teatro: 'teatro', spettacoli: 'teatro',
  sagre: 'enogastronomia', enogastronomia: 'enogastronomia', cibo: 'enogastronomia',
  cinema: 'cinema', film: 'cinema',
  mostra: 'cultura', arte: 'cultura', museo: 'cultura',
  sport: 'sport', gara: 'sport',
  bambini: 'bambini', kids: 'bambini',
  festival: 'spettacolo', mercato: 'spettacolo',
  benessere: 'benessere', yoga: 'benessere', salute: 'benessere',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return slug;
  }
  return 'spettacolo';
}

function parseDateFromText(text: string, year: number): string {
  const lower = text.toLowerCase();
  for (const [monthName, monthNum] of Object.entries(MONTHS_IT)) {
    if (lower.includes(monthName)) {
      const dayMatch = lower.match(/(\d{1,2})/);
      const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
      return `${year}-${monthNum}-${day}`;
    }
  }
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  return '';
}

export async function runCheventiScraper(): Promise<ScrapedEvent[]> {
  console.log('[Cheventi] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const year = new Date().getFullYear();

  const url = `${BASE}/regioni/lazio/latina/`;
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    });
    const $ = cheerio.load(res.data);
    const cards = $('.tmpl-event');
    if (cards.length === 0) {
      console.log('[Cheventi] No .tmpl-event cards found');
    }

    let newCount = 0;
    cards.each((_, el) => {
      const $el = $(el);
      const title = $el.find('.tmpl-event__title').text().trim();
      if (!title) return;

      const href = $el.find('.tmpl-event__link').attr('href') ||
        $el.find('a').first().attr('href') || '';
      const sourceUrl = href.startsWith('http') ? href : `${BASE}${href}`;

      const dateText = $el.find('.tmpl-event__date').text().trim()
        || $el.find('span[class*="date"]').text().trim();
      const date = dateText ? parseDateFromText(dateText, year) : '';

      const city = $el.find('.tmpl-event__city').text().trim() || 'Latina';
      if (!/latina/i.test(city)) return;

      const categoryText = $el.find('.tmpl-event__category').text().trim() || title;
      const category = detectCategory(categoryText);

      const imgSrc = $el.find('img').first().attr('src') || '';
      const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

      const key = title.toLowerCase().slice(0, 60) + date + city;
      if (seen.has(key)) return;
      seen.add(key);
      newCount++;

      all.push({
        title,
        date: date || new Date().toISOString().split('T')[0],
        city,
        province: 'LT',
        category_id: category,
        image_url: imageUrl,
        source_url: sourceUrl,
        source_name: 'Cheventi',
      });
    });

    console.log(`[Cheventi] ${cards.length} cards, ${newCount} new`);
  } catch (err: any) {
    console.error(`[Cheventi] Error: ${err.message?.slice(0, 100)}`);
  }

  console.log(`[Cheventi] Total: ${all.length} unique events`);
  return all;
}
