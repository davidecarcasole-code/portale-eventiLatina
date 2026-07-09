import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.fattivivo.com';

const MONTHS: Record<string, string> = {
  gen: '01', feb: '02', mar: '03', apr: '04', mag: '05', giu: '06',
  lug: '07', ago: '08', set: '09', ott: '10', nov: '11', dic: '12',
};

const CATEGORY_MAP: Record<string, string> = {
  'concerti': 'musica', 'musica': 'musica', 'teatro': 'teatro',
  'sagre': 'enogastronomia', 'sagra': 'enogastronomia',
  'arte': 'cultura', 'sport': 'sport',
  'bambini': 'bambini', 'bambino': 'bambini',
  'festival': 'spettacolo', 'libri': 'cultura', 'turismo': 'gite',
  'equitazione': 'natura', 'basket': 'sport', 'mostra': 'cultura',
  'gratuiti': 'spettacolo', 'danza': 'spettacolo', 'cinema': 'spettacolo',
  'musica jazz': 'musica', 'musica tribute band': 'musica',
  'benessere': 'benessere', 'yoga': 'benessere',
  'salute': 'salute',
  'donna': 'rosa', 'rosa': 'rosa',
};

function detectCategory(label: string): string {
  const lower = label.toLowerCase().trim();
  for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return slug;
  }
  return 'spettacolo';
}

function decodeHtmlEntities(str: string): string {
  return str.replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
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
        const title = $el.attr('data-title') || $el.find('h3').text().trim();
        if (!title) return;
        const decoded = decodeHtmlEntities(title);

        const href = $el.attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `${BASE}${href}`;
        const imgSrc = $el.find('img').first().attr('src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : `${BASE}${imgSrc}`;

        const badge = $el.find('> div').first().find('> div').last();
        const catText = badge.text().trim();
        const category = detectCategory(catText);

        const spans = $el.find('span');
        let dateText = '';
        let locationText = '';
        spans.each((_, s) => {
          const txt = $(s).text().trim();
          if (/\d{1,2}\s+[A-Za-z]{3}/.test(txt) && !dateText) dateText = txt;
          if (txt.includes(',') && !locationText) locationText = txt;
        });

        let date = '';
        const dateMatch = dateText.match(/(\d{1,2})\s*([A-Za-z]{3,})/);
        if (dateMatch) {
          const day = dateMatch[1].padStart(2, '0');
          const monthAbbr = dateMatch[2].toLowerCase().slice(0, 3);
          const month = MONTHS[monthAbbr] || '01';
          date = `${new Date().getFullYear()}-${month}-${day}`;
        }

        const parts = locationText.split(',').map(s => s.trim());
        const city = parts.length > 1 ? parts[parts.length - 1] : (parts[0] || 'Latina');

        const key = decoded.toLowerCase().slice(0, 60) + date + city;
        if (seen.has(key)) return;
        seen.add(key);
        newCount++;

        all.push({
          title: decoded,
          date: date || '2026-07-08',
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
