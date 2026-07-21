import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.parchilazio.it';
const LIST_URL = `${BASE}/parcorivieradiulisse-ricerca_news`;

const MONTHS: Record<string, string> = {
  gen: '01', feb: '02', mar: '03', apr: '04', mag: '05', giu: '06',
  lug: '07', ago: '08', set: '09', ott: '10', nov: '11', dic: '12',
};

function detectCategory(title: string, desc: string): string {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes('yoga') || text.includes('benessere') || text.includes('wellness') || text.includes('meditazione')) return 'benessere';
  if (text.includes('bambini') || text.includes('laboratorio') || text.includes('bimbi') || text.includes('ragazzi') || text.includes('famiglie')) return 'bambini';
  if (text.includes('kayak') || text.includes('canoa') || text.includes('snorkeling') || text.includes('mare') || text.includes('spiaggia')) return 'mare';
  if (text.includes('bici') || text.includes('ciclo') || text.includes('pedala') || text.includes('mtb') || text.includes('nordic walking') || text.includes('sport')) return 'sport';
  if (text.includes('escursion') || text.includes('trekking') || text.includes('cammin') || text.includes('sentiero') || text.includes('passeggiata') || text.includes('itinerario')) return 'escursioni';
  if (text.includes('visita') || text.includes('guidata') || text.includes('archeologia') || text.includes('storia') || text.includes('cultura') || text.includes('mostra')) return 'cultura';
  if (text.includes('natura') || text.includes('foresta') || text.includes('bosco') || text.includes('ambiente')) return 'natura';
  return 'natura';
}

function parseItalianDate(day: string, month: string, year: string): string {
  const m = MONTHS[month.toLowerCase().slice(0, 3)];
  if (!m) return '';
  return `${year}-${m}-${day.padStart(2, '0')}`;
}

async function fetchDetail(url: string): Promise<{ description: string; location: string }> {
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    });
    const $ = cheerio.load(res.data);
    const desc: string[] = [];
    $('.pagina_sec .small p').each((_, el) => {
      const t = $(el).text().trim();
      if (t) desc.push(t);
    });
    const locationMatch = desc.join(' ').match(/Appuntamento:\s*([^\.]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : '';
    return { description: desc.join('\n').slice(0, 2000), location };
  } catch {
    return { description: '', location: '' };
  }
}

export async function runRivieraDiUlisseScraper(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  const pages = [LIST_URL];
  for (let i = 2; i <= 5; i++) {
    pages.push(`${LIST_URL}?attuale=${i}`);
  }

  for (const pageUrl of pages) {
    try {
      const res = await axios.get(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      });
      const $ = cheerio.load(res.data);

      const items: { title: string; date: string; url: string; img: string }[] = [];

      $('article.park_block').each((_, el) => {
        const title = $(el).find('h2 a').first().text().trim();
        if (!title) return;

        const link = $(el).find('h2 a').first().attr('href') || '';
        const fullUrl = link.startsWith('http') ? link : `${BASE}/${link}`;

        const day = $(el).find('date strong').first().text().trim();
        const dateText = $(el).find('date').first().text().trim();
        const dateMatch = dateText.match(/(\w+)\s+(\d{4})/);
        let date = '';
        if (day && dateMatch) {
          date = parseItalianDate(day, dateMatch[1], dateMatch[2]);
        }

        const imgEl = $(el).find('figure img').first();
        const imgSrc = imgEl.attr('data-src') || imgEl.attr('src') || '';
        const imgUrl = imgSrc.startsWith('http') ? imgSrc : imgSrc ? `${BASE}/${imgSrc}` : '';

        items.push({ title, date, url: fullUrl, img: imgUrl });
      });

      for (const item of items) {
        const key = item.title.toLowerCase().slice(0, 60);
        if (seen.has(key)) continue;
        seen.add(key);

        const detail = await fetchDetail(item.url);
        const category = detectCategory(item.title, detail.description);

        let city = 'Formia';
        const text = `${item.title} ${detail.description}`.toLowerCase();
        if (text.includes('sperlonga')) city = 'Sperlonga';
        else if (text.includes('gaeta')) city = 'Gaeta';
        else if (text.includes('formia') || text.includes('gianola')) city = 'Formia';
        else if (text.includes('minturno') || text.includes('scauri')) city = 'Minturno';

        events.push({
          title: item.title.slice(0, 200),
          description: detail.description || undefined,
          date: item.date || new Date().toISOString().split('T')[0],
          city,
          province: 'LT',
          category_id: category,
          location: detail.location || undefined,
          image_url: item.img || undefined,
          source_url: item.url,
          source_name: 'Parco Riviera di Ulisse',
        });
      }
    } catch (err: any) {
      console.error(`[RivieraDiUlisse] Page error: ${err.message?.slice(0, 100)}`);
    }
  }

  console.log(`[RivieraDiUlisse] Total: ${events.length} events`);
  return events;
}
