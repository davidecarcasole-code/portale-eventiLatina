import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://trekkingroma.it';
const LISTING = `${BASE}/eventi/`;

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/trekking|escursione|camminata|sentiero|hiking|guida|nordic walking/.test(lower)) return 'escursioni';
  if (/natura|parco|riserva|fauna|flora/.test(lower)) return 'natura';
  if (/bambini|kids|famiglia/.test(lower)) return 'bambini';
  if (/cultura|mostra|museo|arte/.test(lower)) return 'cultura';
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
  return /latina|circeo|sabaudia|terraccina|pontino|anzio|nettuno|aprilia|cisterna|sermoneta|sonnino|maenza/i.test(lower);
}

export async function runTrekkingRomaScraper(): Promise<ScrapedEvent[]> {
  console.log('[TrekkingRoma] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  for (let page = 1; page <= 5; page++) {
    const url = page === 1 ? LISTING : `${LISTING}page/${page}/`;
    try {
      const res = await axios.get(url, { headers, timeout: 15000 });
      const $ = cheerio.load(res.data);

      const events = $('article, .event-card, [class*="event"], .entry, .post');
      if (events.length === 0) {
        console.log(`[TrekkingRoma] Page ${page}: no more events`);
        break;
      }

      let newCount = 0;
      events.each((_, el) => {
        const $el = $(el);
        const $titleLink = $el.find('h2 a, h3 a, h4 a, .entry-title a').first();
        const title = $titleLink.text().trim() || $el.find('h2, h3, h4').first().text().trim();
        if (!title || title.length < 5) return;

        const href = $titleLink.attr('href') || $el.find('a').first().attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `${BASE}${href}`;

        const dateText = $el.find('time, [class*="date"], .entry-date, span').first().text().trim();
        const date = parseItalianDate(dateText);
        if (!date) return;

        const locationText = $el.find('.location, [class*="location"], .venue, address').text().trim()
          || $el.text().toLowerCase().match(/(?:a|in|presso)\s+([a-z\s]+?)(?:\s*[,.\-]|$)/)?.[1] || '';

        const fullText = title + ' ' + locationText;
        if (!isLatinaProvince(fullText)) return;

        const category = detectCategory(title);

        const imgSrc = $el.find('img').first().attr('src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

        const key = title.toLowerCase().slice(0, 60) + date;
        if (seen.has(key)) return;
        seen.add(key);
        newCount++;

        all.push({
          title: title.substring(0, 200),
          date,
          location: locationText || undefined,
          city: 'Latina',
          province: 'LT',
          category_id: category,
          image_url: imageUrl,
          source_url: sourceUrl,
          source_name: 'TrekkingRoma',
        });
      });

      console.log(`[TrekkingRoma] Page ${page}: ${events.length} events, ${newCount} new`);
    } catch (err: any) {
      console.error(`[TrekkingRoma] Page ${page} error: ${err.message?.slice(0, 100)}`);
      break;
    }
  }

  console.log(`[TrekkingRoma] Total: ${all.length} unique events`);
  return all;
}
