import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const URL = 'https://www.parks.it/parco.nazionale.circeo/';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/escursione|trekking|camminata|sentiero|hiking|guida/.test(lower)) return 'escursioni';
  if (/natura|parco|riserva|fauna|flora|ambiente/.test(lower)) return 'natura';
  if (/bambini|kids|giochi|famiglia/.test(lower)) return 'bambini';
  if (/cultura|mostra|museo|arte|conferenza/.test(lower)) return 'cultura';
  if (/sport|gara|corsa/.test(lower)) return 'sport';
  return 'natura';
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

export async function runParksScraper(): Promise<ScrapedEvent[]> {
  console.log('[Parks] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  try {
    const res = await axios.get(URL, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);

    const eventLinks = $('a[href*="evento"], a[href*="event"], .event-item, .evento, article a, .listing-item a, [class*="event"]');
    eventLinks.each((_, el) => {
      const $el = $(el);
      const title = $el.text().trim().split('\n')[0];
      if (!title || title.length < 5) return;

      const href = $el.attr('href') || '';
      if (!href || href === '#') return;
      const sourceUrl = href.startsWith('http') ? href : `https://www.parks.it${href}`;

      const parent = $el.closest('div, li, article, section');
      const dateText = parent.find('time, [class*="date"], span').first().text().trim()
        || $el.siblings('time, [class*="date"], span').first().text().trim();
      const date = parseItalianDate(dateText) || new Date().toISOString().split('T')[0];

      const category = detectCategory(title);
      const key = title.toLowerCase().slice(0, 60) + date;
      if (seen.has(key)) return;
      seen.add(key);

      all.push({
        title: title.substring(0, 200),
        date,
        city: 'Latina',
        province: 'LT',
        category_id: category,
        source_url: sourceUrl,
        source_name: 'Parks.it - Parco Nazionale del Circeo',
      });
    });

    const sections = $('[class*="event"], [class*="listing"], .block-content');
    sections.each((_, el) => {
      const $sec = $(el);
      const title = $sec.find('h2, h3, h4, .title').first().text().trim();
      if (!title || title.length < 5) return;

      const link = $sec.find('a').first().attr('href') || '';
      const sourceUrl = link.startsWith('http') ? link : (link ? `https://www.parks.it${link}` : URL);

      const dateText = $sec.find('time, [class*="date"], span').first().text().trim();
      const date = parseItalianDate(dateText) || new Date().toISOString().split('T')[0];

      const category = detectCategory(title);
      const key = title.toLowerCase().slice(0, 60) + date;
      if (seen.has(key)) return;
      seen.add(key);

      all.push({
        title: title.substring(0, 200),
        date,
        city: 'Latina',
        province: 'LT',
        category_id: category,
        source_url: sourceUrl,
        source_name: 'Parks.it - Parco Nazionale del Circeo',
      });
    });

    console.log(`[Parks] Found ${all.length} events`);
  } catch (err: any) {
    console.error(`[Parks] Error: ${err.message?.slice(0, 200)}`);
  }

  console.log(`[Parks] Total: ${all.length} events`);
  return all;
}
