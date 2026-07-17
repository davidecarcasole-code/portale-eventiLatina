import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.lazioinfesta.com';

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
  mostra: 'cultura', mostre: 'cultura', arte: 'cultura', museo: 'cultura',
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

function parseDateFromParts($dateEl: cheerio.Cheerio, year: number): string {
  const month = $dateEl.find('.month').text().trim().toLowerCase();
  const day = $dateEl.find('.day').text().trim();
  const monthNum = MONTHS_IT[month] || '01';
  return `${year}-${monthNum}-${day.padStart(2, '0')}`;
}

export async function runLazioinfestaScraper(): Promise<ScrapedEvent[]> {
  console.log('[LazioInfesta] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const year = new Date().getFullYear();

  const startUrl = `${BASE}/eventi/provincia/lt/latina.html`;

  for (let page = 1; page <= 5; page++) {
    const url = page === 1 ? startUrl : `${startUrl}?page=${page}`;
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      });
      const $ = cheerio.load(res.data);
      const boxes = $('.box_evento');
      if (boxes.length === 0) break;

      let newCount = 0;
      boxes.each((_, el) => {
        const $el = $(el);

        const $titleLink = $el.find('h2.tit a');
        const title = $titleLink.text().trim();
        if (!title) return;

        const href = $titleLink.attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `${BASE}${href}`;

        const $start = $el.find('.sx_inizio');
        const date = $start.length ? parseDateFromParts($start, year) : '';

        const $end = $el.find('.dx_fine');
        const endDate = $end.length ? parseDateFromParts($end, year) : undefined;

        const catText = $el.find('p.comments strong').text().trim();
        const category = detectCategory(catText || title);

        const cityLink = $el.find('p.comments a').text().trim();
        const city = cityLink || 'Latina';

        const imgSrc = $el.find('img').first().attr('src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

        const key = title.toLowerCase().slice(0, 60) + date + city;
        if (seen.has(key)) return;
        seen.add(key);
        newCount++;

        all.push({
          title,
          date: date || new Date().toISOString().split('T')[0],
          end_date: endDate,
          city,
          category_id: category,
          image_url: imageUrl,
          source_url: sourceUrl,
          source_name: 'LazioInfesta',
        });
      });

      console.log(`[LazioInfesta] Page ${page}: ${boxes.length} boxes, ${newCount} new`);
    } catch (err: any) {
      console.error(`[LazioInfesta] Page ${page} error: ${err.message?.slice(0, 100)}`);
      break;
    }
  }

  console.log(`[LazioInfesta] Total: ${all.length} unique events`);
  return all;
}
