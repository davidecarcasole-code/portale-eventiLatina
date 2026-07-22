import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE_URL = 'https://iltaccodibacco.it/latina/forkids/';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function parseItalianDate(dateStr: string): { date: string; end_date?: string } {
  const year = new Date().getFullYear();
  const lower = dateStr.toLowerCase();

  const rangeMatch = lower.match(/(\d{1,2})\s*(?:al|a|-)\s*(\d{1,2})\s+(\w+)\s*(\d{4})?/);
  if (rangeMatch) {
    const day1 = rangeMatch[1].padStart(2, '0');
    const day2 = rangeMatch[2].padStart(2, '0');
    const monthName = rangeMatch[3];
    const yr = rangeMatch[4] || year;
    for (const [name, num] of Object.entries(MONTHS_IT)) {
      if (monthName.includes(name)) {
        return { date: `${yr}-${num}-${day1}`, end_date: `${yr}-${num}-${day2}` };
      }
    }
  }

  for (const [monthName, monthNum] of Object.entries(MONTHS_IT)) {
    if (lower.includes(monthName)) {
      const dayMatch = lower.match(/(\d{1,2})/);
      const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
      return { date: `${year}-${monthNum}-${day}` };
    }
  }

  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return { date: isoMatch[0] };

  return { date: '' };
}

export async function runIlTaccoDiBaccoScraper(): Promise<ScrapedEvent[]> {
  console.log('[IlTaccoDiBacco] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  try {
    const res = await axios.get(BASE_URL, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);

    $('article, .event-card, .card, [class*="event"], .entry, .post').each((_, el) => {
      const $el = $(el);
      const title = $el.find('h2, h3, h4, .title, [class*="title"], a').first().text().trim();
      if (!title || title.length < 5) return;

      const href = $el.find('a').first().attr('href') || '';
      const sourceUrl = href.startsWith('http') ? href : (href ? new URL(href, BASE_URL).href : BASE_URL);

      const dateText = $el.find('time, [class*="date"], .date, span').first().text().trim();
      const { date, end_date } = parseItalianDate(dateText);
      if (!date) return;

      const description = $el.find('p, .description, .excerpt').first().text().trim().substring(0, 500);
      const imageUrl = $el.find('img').first().attr('src') || '';

      const key = title.toLowerCase().slice(0, 60) + date;
      if (seen.has(key)) return;
      seen.add(key);

      all.push({
        title: title.substring(0, 200),
        description: description || undefined,
        date,
        end_date: end_date || undefined,
        city: 'Latina',
        province: 'LT',
        category_id: 'bambini',
        image_url: imageUrl || undefined,
        source_url: sourceUrl,
        source_name: 'Il Tacco di Bacco',
      });
    });

    console.log(`[IlTaccoDiBacco] Scraped ${BASE_URL}`);
  } catch (err: any) {
    console.error(`[IlTaccoDiBacco] Error: ${err.message?.slice(0, 100)}`);
  }

  console.log(`[IlTaccoDiBacco] Total: ${all.length} unique events`);
  return all;
}
