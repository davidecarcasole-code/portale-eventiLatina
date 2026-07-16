import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const URLS = [
  'https://www.agescilt3.it/calendario/',
  'https://lazio.agesci.it',
];

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/scout|agesci|oratorio|branco|reparto|clan/.test(lower)) return 'bambini';
  if (/bambini|kids|giochi|famiglia|ragazzi/.test(lower)) return 'bambini';
  if (/escursione|trekking|camminata|sentiero/.test(lower)) return 'escursioni';
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
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  return '';
}

export async function runAgesciScraper(): Promise<ScrapedEvent[]> {
  console.log('[Agesci] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  for (const baseUrl of URLS) {
    try {
      const res = await axios.get(baseUrl, { headers, timeout: 15000 });
      const $ = cheerio.load(res.data);

      const events = $('article, .event, [class*="event"], .calendar-item, .entry, .post, [class*="calendario"]');
      events.each((_, el) => {
        const $el = $(el);
        const title = $el.find('h2, h3, h4, .title, [class*="title"], a').first().text().trim();
        if (!title || title.length < 5) return;

        const href = $el.find('a').first().attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : (href ? new URL(href, baseUrl).href : baseUrl);

        const dateText = $el.find('time, [class*="date"], span').first().text().trim();
        const date = parseItalianDate(dateText);
        if (!date) return;

        const description = $el.find('p, .description').first().text().trim().substring(0, 500);
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
          source_name: 'Agesci Lazio',
        });
      });

      console.log(`[Agesci] Scraped ${baseUrl}`);
    } catch (err: any) {
      console.error(`[Agesci] Error scraping ${baseUrl}: ${err.message?.slice(0, 100)}`);
    }
  }

  console.log(`[Agesci] Total: ${all.length} unique events`);
  return all;
}
