import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.fattivivo.com';

const MONTHS: Record<string, string> = {
  gen: '01', feb: '02', mar: '03', apr: '04', mag: '05', giu: '06',
  lug: '07', ago: '08', set: '09', ott: '10', nov: '11', dic: '12',
};

const CATEGORY_MAP: Record<string, string> = {
  'concerti': 'musica',
  'musica': 'musica',
  'teatro': 'teatro',
  'sagre': 'enogastronomia',
  'arte': 'cultura',
  'sport': 'sport',
  'bambini': 'bambini',
  'festival': 'spettacolo',
  'libri': 'cultura',
  'turismo': 'gite',
  'equitazione': 'natura',
  'basket': 'sport',
  'mostra': 'cultura',
  'gratuiti': 'spettacolo',
  'danza': 'spettacolo',
  'cinema': 'spettacolo',
};

function detectCategory(label: string): string {
  const lower = label.toLowerCase().trim();
  for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return slug;
  }
  return 'spettacolo';
}

function extractCity(locationText: string): string {
  const parts = locationText.split(',').map(s => s.trim());
  return parts.length > 1 ? parts[parts.length - 1] : (parts[0] || 'Latina');
}

export async function runFattivivoScraper(): Promise<ScrapedEvent[]> {
  console.log('[Fattivivo] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= 10; page++) {
    const url = `${BASE}/eventi?page=${page}`;
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      });
      const $ = cheerio.load(res.data);
      const cards = $('a.event-card');
      if (cards.length === 0) break;

      let newCount = 0;
      cards.each((_, el) => {
        const $el = $(el);
        const title = $el.attr('data-title') || $el.find('h3').first().text().trim();
        if (!title) return;

        const href = $el.attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `${BASE}${href}`;
        const imgSrc = $el.find('img').first().attr('src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : `${BASE}${imgSrc}`;

        const divs = $el.find('> div');
        let category = 'spettacolo';
        let locationText = '';
        let priceText = '';
        let hasFree = false;

        divs.each((_, d) => {
          const txt = $(d).text().trim();
          if (!txt) return;
          if (txt === 'GRATUITO') { hasFree = true; return; }
          if (txt.startsWith('€') || txt.startsWith('€')) { priceText = txt; return; }
          if (txt.startsWith('📍')) { locationText = txt.replace('📍', '').trim(); return; }
          if (txt.startsWith('📅')) return;
          if (/^\d+$/.test(txt)) return;
          category = detectCategory(txt);
        });

        const city = extractCity(locationText);

        const dateDiv = $el.find('> div').filter((_, d) => $(d).text().trim().startsWith('📅')).first();
        const dateText = dateDiv.text().trim();

        let date = '';
        const dateMatch = dateText.match(/(\d{1,2})\s*([A-Za-z]+)/);
        if (dateMatch) {
          const day = dateMatch[1].padStart(2, '0');
          const monthAbbr = dateMatch[2].toLowerCase().slice(0, 3);
          const month = MONTHS[monthAbbr] || '01';
          const year = new Date().getFullYear().toString();
          date = `${year}-${month}-${day}`;
        }

        const key = title.toLowerCase().slice(0, 60) + date + city;
        if (seen.has(key)) return;
        seen.add(key);
        newCount++;

        all.push({
          title,
          date: date || '2026-01-01',
          city,
          province: 'LT',
          category_id: category,
          image_url: imageUrl || undefined,
          source_url: sourceUrl,
          source_name: 'FattiVivo',
        });
      });

      console.log(`[Fattivivo] Page ${page}: ${cards.length} cards, ${newCount} new`);
    } catch (err: any) {
      console.error(`[Fattivivo] Page ${page} error: ${err.message?.slice(0, 100)}`);
      break;
    }
  }

  console.log(`[Fattivivo] Total: ${all.length} unique events`);
  return all;
}
