import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.eventiesagre.it';

const MONTHS: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

const CATEGORY_MAP: Record<string, string> = {
  'Concerto': 'musica', 'Musica': 'musica', 'Festival musicale': 'musica',
  'Teatro': 'teatro', 'Spettacolo': 'spettacolo',
  'Sagra': 'enogastronomia', 'Gastronomia': 'enogastronomia', 'Cibo': 'enogastronomia',
  'Mostra': 'cultura', 'Arte': 'cultura', 'Museo': 'cultura',
  'Fiera': 'spettacolo', 'Mercato': 'spettacolo',
  'Sport': 'sport', 'Gara': 'sport',
  'Bambini': 'bambini', 'Laboratorio': 'bambini',
  'Natura': 'natura', 'Escursione': 'natura',
  'Cinema': 'cinema',
  'Benessere': 'benessere',
  'Mare': 'mare', 'Spiaggia': 'mare',
};

function detectCategory(text: string): string {
  for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
    if (text.toLowerCase().includes(key.toLowerCase())) return slug;
  }
  return 'spettacolo';
}

function extractDate(text: string): string | null {
  const m = text.match(/(\d{1,2})\s*(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s*(\d{4})/i);
  if (m) {
    const month = MONTHS[m[2].toLowerCase()];
    if (month) return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
  }
  return null;
}

export async function runEventiesagreScraper(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  const pages = [
    `${BASE}/Regione/Lazio/Provincia-di-Latina/`,
    `${BASE}/Regione/Lazio/Provincia-di-Latina/?pag=2`,
    `${BASE}/Regione/Lazio/Provincia-di-Latina/?pag=3`,
  ];

  for (const url of pages) {
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EventiNLatinaBot/1.0)' },
        timeout: 15000,
      });
      const $ = cheerio.load(res.data);

      $('.evtBox, .evento_box, .event-item, [class*="evento"]').each((_, el) => {
        const titleEl = $(el).find('h3 a, h2 a, .title a, a[href*="evento"]').first();
        const title = titleEl.text().trim() || $(el).find('h3, h2').first().text().trim();
        const link = titleEl.attr('href') || $(el).find('a').first().attr('href') || '';
        const fullUrl = link.startsWith('http') ? link : `${BASE}${link}`;
        const text = $(el).text().trim();

        if (!title || seen.has(title.toLowerCase().slice(0, 60))) return;
        seen.add(title.toLowerCase().slice(0, 60));

        const date = extractDate(text) || extractDate($(el).html() || '');
        const category = detectCategory(text);

        let location = '';
        $(el).find('.luogo, .location, .place, .comune, .citta, [class*="luogo"], [class*="citta"]').each((_, l) => {
          location += ' ' + $(l).text().trim();
        });

        let city = 'Latina';
        const cityMatch = text.match(/Latina|Aprilia|Cisterna|Terracina|Sabaudia|Fondi|Formia|Gaeta|Sperlonga|Pontinia|Sezze|Priverno|Cori|Lenola|Itri|Minturno|Castelforte|Sonnino|Prossedi/i);
        if (cityMatch) city = cityMatch[0].charAt(0).toUpperCase() + cityMatch[0].slice(1).toLowerCase();

        events.push({
          title: title.slice(0, 200),
          description: text.slice(0, 1000),
          date: date || new Date().toISOString().split('T')[0],
          city,
          category_id: category,
          source_url: fullUrl,
          source_name: 'EventieSagre',
        });
      });
    } catch (err: any) {
      console.error(`[EventieSagre] Error: ${err.message}`);
    }
  }

  return events;
}
