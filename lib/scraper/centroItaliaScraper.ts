import * as cheerio from 'cheerio';
import axios from 'axios';
import { ScrapedEvent } from './scraped-event';

function normalizeProvince(code: string): string {
  const map: Record<string, string> = {
    roma: 'RM', latina: 'LT', frosinone: 'FR', viterbo: 'VT', rieti: 'RI',
  };
  return map[code.toLowerCase()] || code.toUpperCase();
}

function capitalizeCity(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const MONTHS_IT: Record<string, string> = {
  'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
  'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
  'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12',
};

function detectCategory(title: string, text: string): string {
  const t = `${title} ${text}`.toLowerCase();
  if (/concerto|musica|dj|band|rock|jazz|coro|orchestra|live|festival\s+musicale|cantante|gruppo\s+musicale/.test(t)) return 'cat_music';
  if (/teatro|danza|spettacolo|commedia|opera|film|cinema|balletto|musical|palcoscenico/.test(t)) return 'cat_theater';
  if (/mostra|museo|arte|fotografia|cultura|conferenza|presentazione|libro|letteratura|poesia|storia|exhibition|esposizione/.test(t)) return 'cat_culture';
  if (/sport|gara|podistica|torneo|yoga|bici|ciclismo|corsa|calcio|pallavolo|basket|tennis|nuoto|maratona|atletica/.test(t)) return 'cat_sports';
  if (/natura|parco|picnic|giardino|orto|flora|fauna|ambiente|riserva|birdwatching|lago/.test(t)) return 'cat_nature';
  if (/trekking|escursione|passeggiata|camminata|sentiero|nordic walking|cavallo|equitazione|cammino/.test(t)) return 'cat_trekking';
  if (/sagra|enogastronomia|vino|cibo|street food|birra|cucina|gastronomia|food|degustazione|olio/.test(t)) return 'cat_food';
  if (/bambini|famiglia|burattini|giochi|animazione|ludoteca|bimbi|ragazzi|scuola|didattica|fattoria/.test(t)) return 'cat_kids';
  if (/festa|fiera|mercatino|collezionismo|luna park|ludico|sfilata|carnevale|mercato|palio|rievocazione/.test(t)) return 'cat_entertainment';
  if (/montagna|rifugio|neve|montagna|vetta|sci|alpino|simbruini|terminillo/.test(t)) return 'cat_mountain';
  if (/gita|borgo|isole|castello|storico|abbazia|eremo|medievale|pellegrinaggio/.test(t)) return 'cat_daytrip';
  if (/benessere|yoga|relax|spa|wellness|massaggi|olistiche|reiki|meditazione|pilates|bagni\s+termali|terme|termale/.test(t)) return 'cat_benessere';
  if (/salute|prevenzione|sanità|visita\s+medica|screening|check.up|donazione\s+sangue|giornata\s+della\s+salute|medico/.test(t)) return 'cat_salute';
  if (/donna|donne|femminile|rosa|8\s+marzo|violenza\s+sulle\s+donne|festadelladonna|al\s+femminile|pari\s+opportunità/.test(t)) return 'cat_rosa';
  return 'cat_entertainment';
}

async function scrapeProvincePage(url: string): Promise<ScrapedEvent[]> {
  let html: string;
  try {
    const res = await axios.get(url, {
      timeout: 12000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    html = res.data;
  } catch (err: any) {
    console.error(`[CentroItalia] fetch error ${url.slice(0, 60)}: ${err.message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];
  const today = new Date();

  $('article.articleflex').each((_i: number, el: any) => {
    const $el = $(el);
    const $link = $el.find('> a');
    const link = $link.attr('href') || '';
    const badge = $el.find('.badge-emblema').attr('title') || '';
    const img = $el.find('img').attr('src') || '';

    const paragraphs: string[] = [];
    $el.find('p').each((_j: number, p: any) => { paragraphs.push($(p).text().trim()); });

    const $b = $el.find('b').first();
    const title = $b.text().trim() || paragraphs[0] || '';
    if (!title || title.length < 5) return;

    const fullText = paragraphs.join(' ');

    let date = new Date().toISOString().split('T')[0];
    let endDate: string | undefined;
    const badgeMatch = badge.match(/Giorni all'inizio:\s*(-?\d+)\s+alla fine:\s*(-?\d+)/);
    if (badgeMatch) {
      const startDays = parseInt(badgeMatch[1]);
      const endDays = parseInt(badgeMatch[2]);
      const start = new Date(today);
      start.setDate(today.getDate() + startDays);
      const end = new Date(today);
      end.setDate(today.getDate() + endDays);
      date = start.toISOString().split('T')[0];
      if (startDays !== endDays) endDate = end.toISOString().split('T')[0];
    }

    const urlParts = link.match(/\/lazio\/(\w+)\/([\w-]+)\//);
    const citySlug = urlParts ? urlParts[2] : 'latina';
    const provCode = urlParts ? normalizeProvince(urlParts[1]) : 'LT';
    const city = capitalizeCity(citySlug);

    const locationMatch = fullText.match(/([A-Za-z\s'-]+)\s*\([A-Z]{2}\)/);
    const location = locationMatch ? locationMatch[1].trim() : city;

    const fullUrl = link.startsWith('http') ? link : `https://www.centroitaliaevents.it${link}`;

    events.push({
      title: title.substring(0, 200),
      description: fullText.substring(0, 500) || undefined,
      date,
      end_date: endDate,
      time_period: 'intera_giornata',
      location: location || city,
      city,
      province: provCode,
      category_id: detectCategory(title, fullText),
      image_url: img ? `https://www.centroitaliaevents.it${img}` : undefined,
      source_url: fullUrl,
      source_name: 'CentroItaliaEvents',
    });
  });

  return events;
}

const PROVINCES = ['latina', 'roma', 'frosinone', 'viterbo', 'rieti'];

export async function runCentroItaliaScraper(): Promise<ScrapedEvent[]> {
  const results = await Promise.allSettled(PROVINCES.map(p => {
    const maxPages = 5;
    const pages: Promise<ScrapedEvent[]>[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1
        ? `https://www.centroitaliaevents.it/lazio/${p}/${p}`
        : `https://www.centroitaliaevents.it/lazio/${p}/page/${page}/`;
      pages.push(scrapeProvincePage(url));
    }
    return (async () => {
      const all: ScrapedEvent[] = [];
      for (let i = 0; i < pages.length; i++) {
        const events = await pages[i];
        if (events.length === 0) break;
        all.push(...events);
        console.log(`[CentroItalia] ${p} page ${i + 1}: ${events.length} events`);
      }
      return all;
    })();
  }));
  const all: ScrapedEvent[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }

  const seen = new Set<string>();
  return all.filter(e => {
    const key = e.title.toLowerCase().slice(0, 60) + e.date + e.city;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
