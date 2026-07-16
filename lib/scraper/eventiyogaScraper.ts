import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const URL = 'https://eventiyoga.it/eventi-yoga/';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/yoga|benessere|meditazione|pilates|wellness|relax|spa|olistico|mindfulness/.test(lower)) return 'benessere';
  if (/trekking|escursione|camminata|sentiero|hiking|guida/.test(lower)) return 'escursioni';
  if (/bambini|kids|campus|sportivo|giochi|famiglia/.test(lower)) return 'bambini';
  if (/natura|parco|riserva|fauna|flora/.test(lower)) return 'natura';
  return 'benessere';
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

export async function runEventiYogaScraper(): Promise<ScrapedEvent[]> {
  console.log('[EventiYoga] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  try {
    const res = await axios.get(URL, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);

    const nextData = $('script#__NEXT_DATA__').html();
    if (nextData) {
      try {
        const json = JSON.parse(nextData);
        const pages = json?.props?.pageProps?.events || json?.props?.pageProps?.data || [];
        for (const ev of pages) {
          const title = ev.title || ev.name || '';
          if (!title) continue;
          const dateStr = ev.date || ev.start_date || ev.startDate || '';
          const date = parseItalianDate(dateStr);
          if (!date) continue;
          const location = ev.location || ev.venue || '';
          const city = location || 'Latina';
          const sourceUrl = ev.url || ev.link || URL;
          const category = detectCategory(title + ' ' + location);

          const key = title.toLowerCase().slice(0, 60) + date;
          if (seen.has(key)) continue;
          seen.add(key);

          all.push({
            title: title.substring(0, 200),
            date,
            city,
            province: 'LT',
            category_id: category,
            source_url: sourceUrl,
            source_name: 'EventiYoga.it',
          });
        }
      } catch {
        console.log('[EventiYoga] Failed to parse __NEXT_DATA__');
      }
    }

    if (all.length === 0) {
      const cards = $('a[href*="/eventi/"], .event-card, .event-item, article, [class*="event"]');
      cards.each((_, el) => {
        const $el = $(el);
        const title = $el.find('h2, h3, h4, .title, [class*="title"]').first().text().trim()
          || $el.text().trim().split('\n')[0];
        if (!title || title.length < 5) return;

        const href = $el.attr('href') || $el.find('a').first().attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `https://eventiyoga.it${href}`;

        const dateText = $el.find('time, [class*="date"], span').first().text().trim();
        const date = parseItalianDate(dateText);
        if (!date) return;

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
          source_url: sourceUrl || URL,
          source_name: 'EventiYoga.it',
        });
      });
    }

    console.log(`[EventiYoga] Found ${all.length} events`);
  } catch (err: any) {
    console.error(`[EventiYoga] Error: ${err.message?.slice(0, 200)}`);
  }

  console.log(`[EventiYoga] Total: ${all.length} events`);
  return all;
}
