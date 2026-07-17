import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.culturalazio.com';

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

function isLatinaRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('latina') || lower.includes('(lt)');
}

export async function runCulturalazioScraper(): Promise<ScrapedEvent[]> {
  console.log('[CulturaLazio] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= 5; page++) {
    const url = page === 1
      ? `${BASE}/agenda/`
      : `${BASE}/agenda/page/${page}/`;
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      });
      const $ = cheerio.load(res.data);
      const posts = $('article.post, .timeline-module article');
      if (posts.length === 0) break;

      let newCount = 0;
      posts.each((_, el) => {
        const $el = $(el);

        const $titleLink = $el.find('.post-content h3 a, h3 a, h2 a').first();
        const title = $titleLink.text().trim();
        if (!title) return;

        const href = $titleLink.attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `${BASE}${href}`;

        const dateStr = $el.find('.post-meta .updated, .post-meta time, .updated').text().trim();
        const date = dateStr ? parseItalianDate(dateStr) : '';

        const imgSrc = $el.find('.post-thumbnail img, img').first().attr('src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `${BASE}${imgSrc}` : undefined);

        const fullText = $el.text();
        const category = detectCategory(title + ' ' + fullText);

        // Try to extract city from text
        const cityMatch = fullText.match(/\((LT|RM|FR|VT|RI)\)/i) || fullText.match(/\b(Latina|Roma|Frosinone|Viterbo|Rieti|Aprilia|Cisterna|Terracina|Fondi|Formia|Gaeta|Sora|Frosinone|Viterbo|Rieti|Civitavecchia|Tivoli|Velletri)\b/i);
        const city = cityMatch ? cityMatch[1] : 'Latina';

        const key = title.toLowerCase().slice(0, 60) + date + city;
        if (seen.has(key)) return;
        seen.add(key);
        newCount++;

        all.push({
          title,
          date: date || new Date().toISOString().split('T')[0],
          city,
          category_id: category,
          image_url: imageUrl,
          source_url: sourceUrl,
          source_name: 'CulturaLazio',
        });
      });

      console.log(`[CulturaLazio] Page ${page}: ${posts.length} posts, ${newCount} new`);
    } catch (err: any) {
      console.error(`[CulturaLazio] Page ${page} error: ${err.message?.slice(0, 100)}`);
      break;
    }
  }

  console.log(`[CulturaLazio] Total: ${all.length} unique events`);
  return all;
}
