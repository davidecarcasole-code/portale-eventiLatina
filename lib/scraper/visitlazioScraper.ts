import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.visitlazio.com';

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

export async function runVisitLazioScraper(): Promise<ScrapedEvent[]> {
  console.log('[VisitLazio] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const year = new Date().getFullYear();

  for (let page = 1; page <= 5; page++) {
    const url = page === 1
      ? `${BASE}/eventi/`
      : `${BASE}/eventi/?page=${page}`;
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      });
      const $ = cheerio.load(res.data);
      const articles = $('article.mec-event-article');
      if (articles.length === 0) break;

      let newCount = 0;
      articles.each((_, el) => {
        const $el = $(el);
        const $titleLink = $el.find('.mec-event-title a');
        const title = $titleLink.text().trim();
        if (!title) return;

        const href = $titleLink.attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `${BASE}${href}`;

        const dayNum = $el.find('.mec-event-date').text().trim();
        const monthName = $el.find('.mec-event-month').text().trim().toLowerCase();
        const monthNum = MONTHS_IT[monthName] || '01';
        const day = dayNum.padStart(2, '0');
        const date = `${year}-${monthNum}-${day}`;

        const locationText = $el.find('.mec-event-loc-place').text().trim();
        if (!locationText.match(/\(LT\)/i) && !/latina/i.test(locationText)) return;

        const cityMatch = locationText.match(/^(.+?)\s*\(/);
        const city = cityMatch ? cityMatch[1].trim() : 'Latina';

        const imgEl = $el.find('img').first();
        const imgSrc = imgEl.attr('src') || imgEl.attr('data-src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

        const category = detectCategory(title + ' ' + locationText);

        const key = title.toLowerCase().slice(0, 60) + date + city;
        if (seen.has(key)) return;
        seen.add(key);
        newCount++;

        all.push({
          title,
          date,
          city,
          province: 'LT',
          category_id: category,
          image_url: imageUrl,
          source_url: sourceUrl,
          source_name: 'VisitLazio',
        });
      });

      console.log(`[VisitLazio] Page ${page}: ${articles.length} articles, ${newCount} new`);
    } catch (err: any) {
      console.error(`[VisitLazio] Page ${page} error: ${err.message?.slice(0, 100)}`);
      break;
    }
  }

  console.log(`[VisitLazio] Total: ${all.length} unique events`);
  return all;
}
