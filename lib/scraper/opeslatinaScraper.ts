import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const URL = 'https://www.opeslatina.it/';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/campus|estivo|bambini|kids|giochi|ragazzi/.test(lower)) return 'bambini';
  if (/sport|gara|corsa|calcio|pallavolo|basket|tennis|nuoto|atletica/.test(lower)) return 'sport';
  if (/yoga|benessere|meditazione/.test(lower)) return 'benessere';
  if (/cultura|mostra|museo|arte/.test(lower)) return 'cultura';
  return 'sport';
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

export async function runOpesLatinaScraper(): Promise<ScrapedEvent[]> {
  console.log('[OpesLatina] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  try {
    const res = await axios.get(URL, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);

    const articles = $('article, .post, .entry, [class*="article"], [class*="post"], .blog-item');
    articles.each((_, el) => {
      const $el = $(el);
      const $titleEl = $el.find('h2 a, h3 a, h4 a, .entry-title a, [class*="title"] a').first();
      const title = $titleEl.text().trim() || $el.find('h2, h3, h4').first().text().trim();
      if (!title || title.length < 5) return;

      const href = $titleEl.attr('href') || $el.find('a').first().attr('href') || '';
      const sourceUrl = href.startsWith('http') ? href : (href ? `https://www.opeslatina.it${href}` : URL);

      const dateText = $el.find('time, [class*="date"], .entry-date, .post-date').first().text().trim();
      const date = parseItalianDate(dateText) || new Date().toISOString().split('T')[0];

      const description = $el.find('p, .entry-excerpt, .excerpt').first().text().trim().substring(0, 500);

      const category = detectCategory(title + ' ' + (description || ''));

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
        source_url: sourceUrl,
        source_name: 'Opes Latina',
      });
    });

    console.log(`[OpesLatina] Found ${all.length} articles`);
  } catch (err: any) {
    console.error(`[OpesLatina] Error: ${err.message?.slice(0, 200)}`);
  }

  console.log(`[OpesLatina] Total: ${all.length} events`);
  return all;
}
