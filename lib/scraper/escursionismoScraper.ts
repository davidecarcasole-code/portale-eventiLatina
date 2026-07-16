import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.escursionismo.it';
const LISTING = `${BASE}/escursioni/`;

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/escursione|trekking|camminata|sentiero|hiking|guida|nordic walking/.test(lower)) return 'escursioni';
  if (/natura|parco|riserva|fauna|flora/.test(lower)) return 'natura';
  if (/bambini|kids|famiglia/.test(lower)) return 'bambini';
  return 'escursioni';
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

function isLatinaProvince(text: string): boolean {
  const lower = text.toLowerCase();
  return /latina|circeo|sabaudia|terraccina|pontino|anzio|nettuno|aprilia|cisterna|sermoneta|sonnino|maenza|\(LT\)/i.test(lower);
}

export async function runEscursionismoScraper(): Promise<ScrapedEvent[]> {
  console.log('[Escursionismo] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  for (let page = 1; page <= 5; page++) {
    const url = page === 1 ? LISTING : `${LISTING}page/${page}/`;
    try {
      const res = await axios.get(url, { headers, timeout: 15000 });
      const $ = cheerio.load(res.data);

      const events = $('article, .escursion, [class*="escursion"], [class*="event"], .entry, .post, li');
      if (events.length === 0) {
        console.log(`[Escursionismo] Page ${page}: no more events`);
        break;
      }

      let newCount = 0;
      events.each((_, el) => {
        const $el = $(el);
        const $titleLink = $el.find('h2 a, h3 a, h4 a, .entry-title a, a').first();
        const title = $titleLink.text().trim() || $el.find('h2, h3, h4').first().text().trim();
        if (!title || title.length < 5) return;

        const href = $titleLink.attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : (href ? `${BASE}${href}` : LISTING);

        const fullText = $el.text();
        if (!isLatinaProvince(fullText)) return;

        const dateText = $el.find('time, [class*="date"], span').first().text().trim()
          || fullText.match(/\d{1,2}\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i)?.[0] || '';
        const date = parseItalianDate(dateText);
        if (!date) return;

        const category = detectCategory(title);

        const key = title.toLowerCase().slice(0, 60) + date;
        if (seen.has(key)) return;
        seen.add(key);
        newCount++;

        all.push({
          title: title.substring(0, 200),
          date,
          city: 'Latina',
          province: 'LT',
          category_id: category,
          source_url: sourceUrl,
          source_name: 'Escursionismo.it',
        });
      });

      console.log(`[Escursionismo] Page ${page}: ${events.length} items, ${newCount} new`);
    } catch (err: any) {
      console.error(`[Escursionismo] Page ${page} error: ${err.message?.slice(0, 100)}`);
      break;
    }
  }

  console.log(`[Escursionismo] Total: ${all.length} unique events`);
  return all;
}
