import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://sagritaly.com';
const URL = `${BASE}/province-sagre/latina/`;

function detectCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('sagra') || t.includes('festival enogastronomico') || t.includes('cibo') || t.includes('vino') || t.includes('birra') || t.includes('gastronomia')) return 'enogastronomia';
  if (t.includes('festa patronale') || t.includes('festa di santo') || t.includes('processione') || t.includes('religiosa') || t.includes('patronale')) return 'cultura';
  if (t.includes('concerto') || t.includes('musica') || t.includes('jazz') || t.includes('rock')) return 'musica';
  if (t.includes('teatro') || t.includes('spettacolo')) return 'teatro';
  if (t.includes('bambini') || t.includes('laboratorio') || t.includes('kids')) return 'bambini';
  if (t.includes('mostra') || t.includes('arte') || t.includes('cultura') || t.includes('medioevale') || t.includes('storica')) return 'cultura';
  if (t.includes('sport') || t.includes('gara') || t.includes('ciclismo')) return 'sport';
  if (t.includes('fiera') || t.includes('mercato')) return 'spettacolo';
  if (t.includes('cinema') || t.includes('film')) return 'cinema';
  return 'enogastronomia';
}

function toDateStr(ddMmYyyy: string): string {
  const parts = ddMmYyyy.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

export async function runSagritalyScraper(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  const pages = [URL];

  for (const pageUrl of pages) {
    try {
      const res = await axios.get(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      });
      const $ = cheerio.load(res.data);

      $('article.w-grid-item').each((_, el) => {
        const title = $(el).find('h3.w-post-elm.post_title a').first().text().trim();
        if (!title) return;

        const key = title.toLowerCase().slice(0, 60);
        if (seen.has(key)) return;
        seen.add(key);

        const startRaw = $(el).find('.w-post-elm.post_custom_field.data_inizio .w-post-elm-value').first().text().trim();
        const endRaw = $(el).find('.w-post-elm.post_custom_field.data_fine .w-post-elm-value').first().text().trim();
        const date = toDateStr(startRaw) || new Date().toISOString().split('T')[0];
        const endDate = toDateStr(endRaw) || undefined;

        const location = $(el).find('.w-post-elm.post_custom_field.luogo_evento .w-post-elm-value').first().text().trim();

        let city = 'Latina';
        if (location) {
          const knownCities = ['Aprilia', 'Bassiano', 'Cisterna', 'Cori', 'Fondi', 'Formia', 'Gaeta', 'Itri', 'Lenola', 'Minturno', 'Norma', 'Pontinia', 'Priverno', 'Prossedi', 'Roccagorga', 'Rocca Massima', 'Sabaudia', 'San Felice Circeo', 'Santi Cosma e Damiano', 'Sermoneta', 'Sezze', 'Sonnino', 'Sperlonga', 'Terracina', 'Campodimele', 'Castelforte', 'Maenza', 'Monte San Biagio', 'Pico', 'Roccasecca', 'Latina'];
          for (const c of knownCities) {
            if (location.toLowerCase().includes(c.toLowerCase())) { city = c; break; }
          }
        }

        const imgEl = $(el).find('.w-post-elm.post_image img').first();
        const imgSrc = imgEl.attr('src') || '';
        const imageUrl = imgSrc.startsWith('http') ? imgSrc : '';

        const link = $(el).find('h3.w-post-elm.post_title a').first().attr('href') || '';
        const fullUrl = link.startsWith('http') ? link : `${BASE}${link}`;

        const category = detectCategory(title);

        const fullText = $(el).text();
        const isPassed = fullText.includes('Passati');

        if (isPassed) return;

        events.push({
          title: title.slice(0, 200),
          date,
          end_date: endDate,
          city,
          province: 'LT',
          category_id: category,
          location: location || undefined,
          image_url: imageUrl || undefined,
          source_url: fullUrl,
          source_name: 'Sagritaly',
        });
      });
    } catch (err: any) {
      console.error(`[Sagritaly] Page error: ${err.message?.slice(0, 100)}`);
    }
  }

  console.log(`[Sagritaly] Total: ${events.length} events`);
  return events;
}
