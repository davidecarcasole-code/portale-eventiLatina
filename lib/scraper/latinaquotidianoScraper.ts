import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.latinaquotidiano.it';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

const CATEGORY_MAP: Record<string, string> = {
  concerti: 'musica', musica: 'musica', live: 'musica',
  teatro: 'teatro', spettacoli: 'teatro',
  sagre: 'enogastronomia', enogastronomia: 'enogastronomia', cibo: 'enogastronomia',
  cinema: 'cinema', film: 'cinema',
  mostra: 'cultura', mostre: 'cultura', arte: 'cultura', museo: 'cultura',
  sport: 'sport', gara: 'sport',
  bambini: 'bambini', kids: 'bambini',
  festival: 'spettacolo', mercato: 'spettacolo',
  benessere: 'benessere', yoga: 'benessere', salute: 'benessere',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return slug;
  }
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

function isEventRelated(title: string, text: string): boolean {
  const combined = `${title} ${text}`.toLowerCase();
  return /evento|manifestazione|festa|concerto|mostra|spettacolo|sagra|festival|mercato|culturale|teatro|cinema|sport|incontro|laboratorio|presentazione|aperitivo|dj|live/.test(combined);
}

export async function runLatinaquotidianoScraper(): Promise<ScrapedEvent[]> {
  console.log('[LatinaQuotidiano] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();

  const url = BASE;
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    });
    const $ = cheerio.load(res.data);

    const articles = $('article, .entry, .post, div[class*="article"], div[class*="news"]');
    if (articles.length === 0) {
      console.log('[LatinaQuotidiano] No article entries found');
    }

    let newCount = 0;
    articles.each((_, el) => {
      const $el = $(el);

      const $titleEl = $el.find('h2 a, h3 a, h4 a, .entry-title a, .article-title a').first();
      const title = $titleEl.text().trim() || $el.find('h2, h3, h4').first().text().trim();
      if (!title || title.length < 5) return;

      const fullText = $el.text();
      if (!isEventRelated(title, fullText)) return;

      const href = $titleEl.attr('href') || $el.find('a').first().attr('href') || '';
      const sourceUrl = href.startsWith('http') ? href : (href ? `${BASE}${href}` : url);

      const dateStr = $el.find('.date, time, .entry-date, .article-date, span[class*="date"], span[class*="time"]').text().trim();
      const date = dateStr ? parseItalianDate(dateStr) : '';

      const category = detectCategory(title + ' ' + fullText);

      const imgSrc = $el.find('img').first().attr('src') || '';
      const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

      const key = title.toLowerCase().slice(0, 60) + date;
      if (seen.has(key)) return;
      seen.add(key);
      newCount++;

      all.push({
        title,
        date: date || new Date().toISOString().split('T')[0],
        city: 'Latina',
        province: 'LT',
        category_id: category,
        image_url: imageUrl,
        source_url: sourceUrl,
        source_name: 'LatinaQuotidiano',
      });
    });

    console.log(`[LatinaQuotidiano] ${articles.length} articles, ${newCount} new`);
  } catch (err: any) {
    console.error(`[LatinaQuotidiano] Error: ${err.message?.slice(0, 100)}`);
  }

  console.log(`[LatinaQuotidiano] Total: ${all.length} unique events`);
  return all;
}
