import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://lazioeventi.com';
const LISTING = `${BASE}/oggi-nel-lazio`;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  musica: ['concerto', 'musica', 'live', 'dj set', 'band', 'cantante', 'orchestra', 'coro', 'musicista', 'festival musicale', 'note'],
  teatro: ['teatro', 'spettacolo teatrale', 'commedia', 'dramma', 'opera', 'balletto', 'circo', 'one man show', 'cabaret'],
  cultura: ['mostra', 'conferenza', 'convegno', 'incontro', 'presentazione', 'libro', 'reading', 'poesia', 'cinema', 'film', 'documentario', 'arte', 'fotografia'],
  sport: ['sport', 'partita', 'gara', 'corsa', 'torneo', 'maratona', 'ciclismo', 'calcio', 'pallavolo', 'basket', 'tennis'],
  natura: ['natura', 'parco', 'giardino', 'passeggiata', 'ambiente', 'escursione', 'flora', 'fauna', 'giardino botanico'],
  trekking: ['trekking', 'sentiero', 'camminata', 'cammino', 'montagna', 'collina', 'passeggiata ecologica'],
  enogastronomia: ['enogastronomia', 'vino', 'cibo', 'degustazione', 'sagra', 'mercato', 'gastronomia', 'food', 'wine', 'street food'],
  bambini: ['bambini', 'kids', 'laboratorio', 'famiglia', 'bimbi', 'ragazzi', 'scuola', 'bambino', 'genitori'],
  borghi: ['borgo', 'paese', 'centro storico', 'medievale', 'castello', 'rocca', 'fortezza'],
  benessere: ['benessere', 'yoga', 'meditazione', 'relax', 'spa', 'olistico', 'mindfulness', 'pilates', 'benessere psicologico'],
  salute: ['salute', 'medicina', 'prevenzione', 'salute pubblica', 'benessere fisico', 'cura'],
  rosa: ['donna', 'femminile', 'parità', 'genere', 'mamma', 'rosa'],
};

function detectCategory(title: string): string {
  const text = title.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        scores[slug] = (scores[slug] || 0) + 1;
      }
    }
  }
  let best = 'cultura';
  let bestScore = 0;
  for (const [slug, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = slug;
    }
  }
  return best;
}

function parseItalianDate(dateStr: string): string {
  const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return '';
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3];
  return `${year}-${month}-${day}`;
}

function normalizeCity(city: string): string {
  return city.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function parsePage(html: string): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];

  $('div.em-event.em-item').each((_, el) => {
    const $card = $(el);

    const title = $card.find('h3.em-item-title a').first().text().trim();
    if (!title) return;

    const sourceUrl = $card.attr('data-href') || '';
    const dateText = $card.find('.em-event-date').first().text().trim();
    const timeText = $card.find('.em-event-time').first().text().trim();
    const anchorText = $card.find('.em-event-location a').first().text().trim();
    const imgSrc = $card.find('img').first().attr('data-lazy-src') || $card.find('img').first().attr('src') || '';

    if (!dateText) return;
    const date = parseItalianDate(dateText);
    if (!date) return;

    const city = normalizeCity(anchorText || 'Latina');
    const category = detectCategory(title);

    let time: string | undefined;
    if (timeText && timeText !== 'Tutto il giorno' && timeText !== '00:00') {
      time = timeText.split(' - ')[0].trim();
    }

    events.push({
      title: title.slice(0, 200),
      date,
      time: time || undefined,
      location: anchorText || undefined,
      city: city || 'Latina',
      province: 'LT',
      category_id: category,
      image_url: (imgSrc && (imgSrc.startsWith('http') || imgSrc.startsWith('//')))
        ? (imgSrc.startsWith('//') ? `https:${imgSrc}` : imgSrc)
        : undefined,
      source_url: sourceUrl || LISTING,
      source_name: 'LazioEventi.com',
    });
  });

  return events;
}

export async function runLazioEventiScraper(): Promise<ScrapedEvent[]> {
  console.log('[LazioEventi] Fetching listing...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  for (let page = 1; page <= 5; page++) {
    const url = page === 1 ? LISTING : `${LISTING}?pno=${page}`;
    try {
      const res = await axios.get(url, { headers, timeout: 15000 });
      const html = res.data;

      if (typeof html !== 'string' || html.includes('Nessun evento trovato') || html.trim().length < 100) {
        console.log(`[LazioEventi] Page ${page}: no more events`);
        break;
      }

      const events = parsePage(html);
      if (events.length === 0) {
        // If page has content but zero events parsed, log it but don't break
        console.log(`[LazioEventi] Page ${page}: 0 events parsed (html length: ${html.length})`);
        break;
      }

      let newCount = 0;
      for (const e of events) {
        const key = e.title.toLowerCase().slice(0, 60) + e.date + e.city;
        if (!seen.has(key)) {
          seen.add(key);
          all.push(e);
          newCount++;
        }
      }
      console.log(`[LazioEventi] Page ${page}: ${events.length} events, ${newCount} new`);
    } catch (err: any) {
      console.error(`[LazioEventi] Page ${page} error: ${err.message?.slice(0, 200)}`);
      break;
    }
  }

  console.log(`[LazioEventi] Total: ${all.length} unique events`);
  return all;
}
