import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE_URL = 'https://www.luogoarte.it/immersioni-sonore.html';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function parseItalianDate(dateStr: string): { date: string; time?: string } {
  const year = new Date().getFullYear();
  const lower = dateStr.toLowerCase();

  let time: string | undefined;
  const timeMatch = lower.match(/ore\s*(\d{1,2})[.:](\d{2})/);
  if (timeMatch) {
    time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }

  for (const [monthName, monthNum] of Object.entries(MONTHS_IT)) {
    if (lower.includes(monthName)) {
      const dayMatch = lower.match(/(\d{1,2})/);
      const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
      const yearMatch = lower.match(/(\d{4})/);
      const yr = yearMatch ? yearMatch[1] : year;
      return { date: `${yr}-${monthNum}-${day}`, time };
    }
  }

  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return { date: isoMatch[0], time };

  return { date: '' };
}

export async function runLuogoArteScraper(): Promise<ScrapedEvent[]> {
  console.log('[LuogoArte] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  try {
    const res = await axios.get(BASE_URL, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);

    $('article, .event, [class*="event"], .concert, section').each((_, el) => {
      const $el = $(el);
      const title = $el.find('h2, h3, h4, .title, strong, b').first().text().trim();
      if (!title || title.length < 5) return;

      const fullText = $el.text();
      const dateMatch = fullText.match(/CONCERTO DEL (\d{1,2})\s+(\w+)\s+(\d{4})/i);
      if (!dateMatch) return;

      const day = dateMatch[1].padStart(2, '0');
      const monthName = dateMatch[2].toLowerCase();
      const yr = dateMatch[3];
      const monthNum = MONTHS_IT[monthName];
      if (!monthNum) return;

      const timeMatch = fullText.match(/ORE\s*(\d{1,2})[.:](\d{2})/i);
      const time = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : undefined;

      const date = `${yr}-${monthNum}-${day}`;

      const description = $el.find('p').first().text().trim().substring(0, 500) || title;
      const location = 'Lungomare di Latina';

      const key = title.toLowerCase().slice(0, 60) + date;
      if (seen.has(key)) return;
      seen.add(key);

      all.push({
        title: title.substring(0, 200),
        description: description || undefined,
        date,
        time,
        location,
        city: 'Latina',
        province: 'LT',
        category_id: 'mare',
        source_url: BASE_URL,
        source_name: 'LuogoArte - Immersioni Sonore',
      });
    });

    console.log(`[LuogoArte] Scraped ${BASE_URL}`);
  } catch (err: any) {
    console.error(`[LuogoArte] Error: ${err.message?.slice(0, 100)}`);
  }

  console.log(`[LuogoArte] Total: ${all.length} unique events`);
  return all;
}
