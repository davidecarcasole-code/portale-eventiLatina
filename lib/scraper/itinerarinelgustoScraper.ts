import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.itinerarinelgusto.it';
const URL = `${BASE}/sagre-e-feste/latina/`;

const MONTHS: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '10', ottobre: '10', novembre: '11', dicembre: '12',
};

const TOWN_MAP: Record<string, string> = {
  'bassiano': 'Bassiano', 'latina': 'Latina', 'priverno': 'Priverno',
  'sabaudia': 'Sabaudia', 'cisterna': 'Cisterna di Latina',
  'terracina': 'Terracina', 'fondi': 'Fondi', 'formia': 'Formia',
  'gaeta': 'Gaeta', 'sperlonga': 'Sperlonga', 'pontinia': 'Pontinia',
  'sezze': 'Sezze', 'cori': 'Cori', 'lenola': 'Lenola',
  'itri': 'Itri', 'minturno': 'Minturno', 'castelforte': 'Castelforte',
  'sonnino': 'Sonnino', 'prossedi': 'Prossedi', 'norma': 'Norma',
  'sermoneta': 'Sermoneta', 'roccagorga': 'Roccagorga',
  'maenza': 'Maenza', 'roccasecca': 'Roccasecca', 'pico': 'Pico',
  'san felice circeo': 'San Felice Circeo',
};

function detectCategory(title: string, desc: string): string {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes('sagra')) return 'enogastronomia';
  if (text.includes('concerto') || text.includes('musica')) return 'musica';
  if (text.includes('teatro') || text.includes('spettacolo')) return 'teatro';
  if (text.includes('bambini') || text.includes('laboratorio')) return 'bambini';
  if (text.includes('sport') || text.includes('gara')) return 'sport';
  if (text.includes('mostra') || text.includes('arte')) return 'cultura';
  if (text.includes('cinema') || text.includes('film')) return 'cinema';
  if (text.includes('escursion') || text.includes('trekking') || text.includes('natura')) return 'natura';
  if (text.includes('benessere') || text.includes('yoga')) return 'benessere';
  if (text.includes('fiera') || text.includes('mercato')) return 'spettacolo';
  return 'enogastronomia';
}

export async function runItinerarinelgustoScraper(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  const pages = [
    URL,
    `${URL}?page=2`,
    `${URL}?page=3`,
    `${URL}?page=4`,
  ];

  for (const pageUrl of pages) {
    try {
      const res = await axios.get(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      });
      const $ = cheerio.load(res.data);

      $('div.row.tile.post.pad').each((_, el) => {
        const title = $(el).find('p.events-list-title a').first().text().trim();
        if (!title) return;

        const key = title.toLowerCase().slice(0, 60);
        if (seen.has(key)) return;
        seen.add(key);

        const startDate = $(el).find('meta[itemprop="startDate"]').first().attr('content') || '';
        const endDate = $(el).find('meta[itemprop="endDate"]').first().attr('content') || '';
        const date = startDate ? startDate.split('T')[0] : '';
        const end_date = endDate ? endDate.split('T')[0] : undefined;

        const desc = $(el).find('p.abstract').first().text().trim();

        const imgEl = $(el).find('figure.box-pic img').first();
        const imgSrc = imgEl.attr('src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : '';

        const sourceUrl = $(el).find('p.events-list-title a').first().attr('href') || '';
        const fullUrl = sourceUrl.startsWith('http') ? sourceUrl : `${BASE}${sourceUrl}`;

        const placeText = $(el).find('p.event-header.event-place').first().text().trim();
        let city = 'Latina';
        for (const [key, name] of Object.entries(TOWN_MAP)) {
          if (placeText.toLowerCase().includes(key)) { city = name; break; }
        }
        if (city === 'Latina') {
          const link = $(el).find('p.event-header.event-place a').first().attr('href') || '';
          const match = link.match(/\/([^/]+)$/);
          if (match) {
            const slug = match[1].toLowerCase();
            for (const [key, name] of Object.entries(TOWN_MAP)) {
              if (slug.includes(key)) { city = name; break; }
            }
          }
        }
        const category = detectCategory(title, desc);

        const dateTxt = $(el).find('span.eventi-data').first().text().trim();
        const statusEl = $(el).find('span.tag').first().text().trim();
        const isConcluded = statusEl.includes('concluso') || dateTxt.includes('concluso');

        if (isConcluded) return;

        events.push({
          title: title.slice(0, 200),
          description: desc.slice(0, 2000) || undefined,
          date: date || '2026-01-01',
          end_date,
          city,
          province: 'LT',
          category_id: category,
          image_url: imageUrl || undefined,
          source_url: fullUrl,
          source_name: 'Itinerari nel Gusto',
        });
      });
    } catch (err: any) {
      console.error(`[ItinerariNelGusto] Page error: ${err.message?.slice(0, 100)}`);
    }
  }

  console.log(`[ItinerariNelGusto] Total: ${events.length} events`);
  return events;
}
