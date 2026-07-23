import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.cheventi.it';

const CATEGORY_MAP: Record<string, string> = {
  concerti: 'musica', musica: 'musica', live: 'musica',
  teatro: 'teatro', spettacoli: 'teatro',
  sagre: 'enogastronomia', sagra: 'enogastronomia', enogastronomia: 'enogastronomia', cibo: 'enogastronomia',
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

function parseDateFromISO(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  return '';
}

export async function runCheventiScraper(): Promise<ScrapedEvent[]> {
  console.log('[Cheventi] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();

  const url = `${BASE}/regioni/lazio/latina/`;
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    });
    const $ = cheerio.load(res.data);
    const cards = $('.events-list-container__list__single');
    if (cards.length === 0) {
      console.log('[Cheventi] No .events-list-container__list__single cards found');
    }

    let newCount = 0;
    cards.each((_, el) => {
      const $el = $(el);

      const title = $el.find('.events-list-container__list__single__title-text').text().trim()
        || $el.find('h3[itemprop="name"]').text().trim();
      if (!title) return;

      const href = $el.find('.events-list-container__list__single__title').attr('href')
        || $el.find('.events-list-container__list__single__img').attr('href')
        || '';
      const sourceUrl = href.startsWith('http') ? href : `${BASE}${href}`;

      const startDateISO = $el.find('[itemprop="startDate"]').attr('content') || '';
      const date = startDateISO ? parseDateFromISO(startDateISO) : '';

      const placeText = $el.find('.events-list-container__list__single__place').text().trim();
      const cityMatch = placeText.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
      const city = cityMatch ? cityMatch[1].trim() : (placeText || 'Latina');
      const region = cityMatch ? cityMatch[2] : '';

      const categoryLinks = $el.find('.label-category');
      let category = 'spettacolo';
      if (categoryLinks.length > 0) {
        const catHref = categoryLinks.attr('href') || '';
        const catMatch = catHref.match(/cats=([^&]+)/);
        if (catMatch) category = detectCategory(catMatch[1]);
      }
      if (category === 'spettacolo') category = detectCategory(title);

      const imgSrc = $el.find('.events-list-container__list__single__img img').attr('src') || '';
      const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

      const key = title.toLowerCase().slice(0, 60) + date + city;
      if (seen.has(key)) return;
      seen.add(key);
      newCount++;

      all.push({
        title,
        date: date || new Date().toISOString().split('T')[0],
        city,
        province: region || 'LT',
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
