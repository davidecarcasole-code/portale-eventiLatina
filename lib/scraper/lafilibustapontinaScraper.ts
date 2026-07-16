import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://lafilibustapontina.it';
const LISTING = `${BASE}/events/`;

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/escursione|trekking|camminata|sentiero|hiking|guida|visita guidata/.test(lower)) return 'escursioni';
  if (/yoga|benessere|meditazione|pilates/.test(lower)) return 'benessere';
  if (/bambini|kids|campus|giochi|famiglia/.test(lower)) return 'bambini';
  if (/natura|parco|riserva/.test(lower)) return 'natura';
  if (/cultura|mostra|museo|arte|conferenza/.test(lower)) return 'cultura';
  if (/sport|gara|corsa/.test(lower)) return 'sport';
  return 'escursioni';
}

function parseDateFromText(text: string): string {
  const year = new Date().getFullYear();
  const lower = text.toLowerCase();
  for (const [monthName, monthNum] of Object.entries(MONTHS_IT)) {
    if (lower.includes(monthName)) {
      const dayMatch = lower.match(/(\d{1,2})/);
      const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
      return `${year}-${monthNum}-${day}`;
    }
  }
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  return '';
}

export async function runLaFilibustaScraper(): Promise<ScrapedEvent[]> {
  console.log('[LaFilibusta] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  for (let page = 1; page <= 5; page++) {
    const url = page === 1 ? LISTING : `${LISTING}page/${page}/`;
    try {
      const res = await axios.get(url, { headers, timeout: 15000 });
      const $ = cheerio.load(res.data);

      const events = $('.tribe-events-calendar-list__event');
      if (events.length === 0) {
        console.log(`[LaFilibusta] Page ${page}: no more events`);
        break;
      }

      let newCount = 0;
      events.each((_, el) => {
        const $card = $(el);
        const $titleLink = $card.find('.tribe-events-calendar-list__event-title a');
        const title = $titleLink.text().trim();
        if (!title) return;

        const href = $titleLink.attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `${BASE}${href}`;

        const dateText = $card.find('.tribe-events-calendar-list__event-datetime').text().trim();
        const date = parseDateFromText(dateText);
        if (!date) return;

        const location = $card.find('.tribe-events-calendar-list__event-venue').text().trim();
        const city = location || 'Latina';

        const imgSrc = $card.find('img').first().attr('src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

        const category = detectCategory(title + ' ' + location);

        const key = title.toLowerCase().slice(0, 60) + date + city;
        if (seen.has(key)) return;
        seen.add(key);
        newCount++;

        all.push({
          title: title.substring(0, 200),
          date,
          location: location || undefined,
          city,
          province: 'LT',
          category_id: category,
          image_url: imageUrl,
          source_url: sourceUrl,
          source_name: 'La FiliBusta Pontina',
        });
      });

      console.log(`[LaFilibusta] Page ${page}: ${events.length} events, ${newCount} new`);
    } catch (err: any) {
      console.error(`[LaFilibusta] Page ${page} error: ${err.message?.slice(0, 100)}`);
      break;
    }
  }

  console.log(`[LaFilibusta] Total: ${all.length} unique events`);
  return all;
}
