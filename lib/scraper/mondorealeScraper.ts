import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.mondoreale.it';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/spettacolo|concerto|teatro|musica|dj|live|festival/.test(lower)) return 'spettacolo';
  if (/cultura|mostra|museo|arte|conferenza|storia/.test(lower)) return 'cultura';
  if (/sport|gara|corsa|calcio/.test(lower)) return 'sport';
  if (/bambini|kids|giochi|famiglia/.test(lower)) return 'bambini';
  if (/enogastronomia|sagra|cibo|vino/.test(lower)) return 'enogastronomia';
  if (/natura|parco|riserva/.test(lower)) return 'natura';
  if (/escursione|trekking|camminata/.test(lower)) return 'escursioni';
  if (/benessere|yoga|meditazione/.test(lower)) return 'benessere';
  return 'spettacolo';
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
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  return '';
}

export async function runMondorealeScraper(): Promise<ScrapedEvent[]> {
  console.log('[MondoReale] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  for (let page = 1; page <= 5; page++) {
    const url = page === 1 ? BASE : `${BASE}/page/${page}/`;
    try {
      const res = await axios.get(url, { headers, timeout: 15000 });
      const $ = cheerio.load(res.data);

      const articles = $('article, .post, .entry, [class*="article"], [class*="post"]');
      if (articles.length === 0) {
        console.log(`[MondoReale] Page ${page}: no more articles`);
        break;
      }

      let newCount = 0;
      articles.each((_, el) => {
        const $el = $(el);
        const $titleLink = $el.find('h2 a, h3 a, h4 a, .entry-title a, [class*="title"] a').first();
        const title = $titleLink.text().trim() || $el.find('h2, h3, h4').first().text().trim();
        if (!title || title.length < 5) return;

        const href = $titleLink.attr('href') || $el.find('a').first().attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : (href ? `${BASE}${href}` : BASE);

        const dateText = $el.find('time, [class*="date"], .entry-date, .post-date').first().text().trim();
        const date = parseItalianDate(dateText) || new Date().toISOString().split('T')[0];

        const description = $el.find('p, .entry-excerpt, .excerpt, [class*="excerpt"]').first().text().trim().substring(0, 500);
        const fullText = title + ' ' + (description || '');

        const category = detectCategory(fullText);

        const imgSrc = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

        const key = title.toLowerCase().slice(0, 60) + date;
        if (seen.has(key)) return;
        seen.add(key);
        newCount++;

        all.push({
          title: title.substring(0, 200),
          description: description || undefined,
          date,
          city: 'Latina',
          province: 'LT',
          category_id: category,
          image_url: imageUrl,
          source_url: sourceUrl,
          source_name: 'MondoReale.it',
        });
      });

      console.log(`[MondoReale] Page ${page}: ${articles.length} articles, ${newCount} new`);
    } catch (err: any) {
      console.error(`[MondoReale] Page ${page} error: ${err.message?.slice(0, 100)}`);
      break;
    }
  }

  console.log(`[MondoReale] Total: ${all.length} unique events`);
  return all;
}
