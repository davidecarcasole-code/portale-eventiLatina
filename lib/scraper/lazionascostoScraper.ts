import * as cheerio from 'cheerio';
import axios from 'axios';
import { ScrapedEvent } from './scraped-event';

const MONTHS_SLUG: Record<string, string> = {
  'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
  'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
  'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12',
};

function detectCategory(title: string, text: string): string {
  const t = `${title} ${text}`.toLowerCase();
  if (/concerto|musica|dj|band|rock|jazz|coro|orchestra|live|festival\s+musicale|cantante|gruppo\s+musicale|rassegna musicale/.test(t)) return 'cat_music';
  if (/teatro|danza|spettacolo|commedia|opera|balletto|musical|palcoscenico/.test(t)) return 'cat_theater';
  if (/cinema|film|documentario|proiezione|rassegna|cinemateca|cineforum|pellicola|regista/.test(t)) return 'cat_cinema';
  if (/mostra|museo|arte|fotografia|cultura|conferenza|presentazione|libro|letteratura|poesia|storia|exhibition|esposizione/.test(t)) return 'cat_culture';
  if (/sport|gara|podistica|torneo|yoga|bici|ciclismo|corsa|calcio|pallavolo|basket|tennis|nuoto|maratona|atletica/.test(t)) return 'cat_sports';
  if (/natura|parco|picnic|giardino|orto|flora|fauna|ambiente|riserva|birdwatching|lago/.test(t)) return 'cat_nature';
  if (/trekking|escursione|passeggiata|camminata|sentiero|nordic walking|cavallo|equitazione|cammino/.test(t)) return 'cat_trekking';
  if (/sagra|enogastronomia|vino|cibo|street food|birra|cucina|gastronomia|food|degustazione|olio|gastronomic/.test(t)) return 'cat_food';
  if (/bambini|famiglia|burattini|giochi|animazione|ludoteca|bimbi|ragazzi|scuola|didattica|fattoria/.test(t)) return 'cat_kids';
  if (/festa|fiera|mercatino|collezionismo|luna park|ludico|sfilata|carnevale|mercato|palio|rievocazione/.test(t)) return 'cat_entertainment';
  if (/montagna|rifugio|neve|montagna|vetta|sci|alpino|simbruini|terminillo/.test(t)) return 'cat_mountain';
  if (/gita|borgo|isole|castello|storico|abbazia|eremo|medievale|pellegrinaggio/.test(t)) return 'cat_daytrip';
  if (/mare|spiaggia|lido|bagno|costa|litorale|sabbia|nuoto|vela|windsurf|kitesurf|sub|immersione|porto|approdo/.test(t)) return 'cat_sea';
  if (/circeo|sabaudia|terracina|formia|gaeta|san felice|santa marinella|sperlonga|pontina|torre/.test(t)) return 'cat_sea';
  if (/benessere|yoga|relax|spa|wellness|massaggi|olistiche|reiki|meditazione|pilates|bagni\s+termali|terme|termale/.test(t)) return 'cat_benessere';
  if (/salute|prevenzione|sanità|visita\s+medica|screening|check.up|donazione\s+sangue|giornata\s+della\s+salute|medico/.test(t)) return 'cat_salute';
  if (/donna|donne|femminile|rosa|8\s+marzo|violenza\s+sulle\s+donne|festadelladonna|al\s+femminile|pari\s+opportunità/.test(t)) return 'cat_rosa';
  return 'cat_entertainment';
}

function extractLocation(text: string): { city: string; province: string } {
  const m = text.match(/\(([A-Z]{2})\)/);
  const provCode = m ? m[1] : 'LT';
  const cityMatch = text.match(/\ba\s+([A-Za-z\u00C0-\u024F\s'-]+?)\s*\([A-Z]{2}\)/);
  const city = cityMatch ? cityMatch[1].trim() : 'Lazio';
  return { city, province: provCode };
}

function parseDateString(dateText: string): { dates: string[] } {
  const result: string[] = [];
  const currentYear = new Date().getFullYear();
  const year = currentYear;

  const monthsRE = /(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/gi;
  const parts = dateText.replace(/[()]/g, '').split('|');

  for (const part of parts) {
    const monthMatch = part.match(monthsRE);
    if (!monthMatch) continue;

    const monthName = monthMatch[monthMatch.length - 1].toLowerCase();
    const monthNum = MONTHS_SLUG[monthName];
    if (!monthNum) continue;

    const yearMatch = part.match(/(\d{4})/);
    const eventYear = yearMatch ? yearMatch[1] : String(year);

    const dayMatches = part.match(/\b(\d{1,2})\b/g);
    if (!dayMatches) {
      result.push(`${eventYear}-${monthNum}-01`);
      continue;
    }

    for (const dayStr of dayMatches) {
      const day = parseInt(dayStr);
      if (day >= 1 && day <= 31) {
        result.push(`${eventYear}-${monthNum}-${String(day).padStart(2, '0')}`);
      }
    }
  }

  return { dates: [...new Set(result)].sort() };
}

async function scrapeMonthPage(month: string): Promise<ScrapedEvent[]> {
  const url = `https://www.lazionascosto.it/eventi-lazio/${month}/`;
  let html: string;
  try {
    const res = await axios.get(url, {
      timeout: 12000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    html = res.data;
  } catch (err: any) {
    console.error(`[LazioNascosto] fetch error ${url}: ${err.message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];

  $('.wpb_text_column').each((_i: number, el: any) => {
    const $el = $(el);
    const $h5 = $el.find('h5');
    if (!$h5.length) return;

    const $link = $h5.find('a');
    const title = $link.text().trim();
    if (!title || title.length < 5) return;

    const linkHref = $link.attr('href') || '';
    if (!linkHref) return;

    const $dateSpan = $h5.find('span[style*="color: #ff6600"], span[style*="color:#ff6600"]');
    const dateText = $dateSpan.text().trim();
    if (!dateText) return;

    const { city, province } = extractLocation(title);

    const { dates } = parseDateString(dateText);
    if (dates.length === 0) return;

    const startDate = dates[0];
    const endDate = dates.length > 1 ? dates[dates.length - 1] : undefined;

    const description = $el.text()
      .replace(title, '')
      .replace(dateText, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);

    events.push({
      title: title.substring(0, 200),
      description: description || undefined,
      date: startDate,
      end_date: endDate,
      time_period: 'intera_giornata',
      location: city,
      city,
      province,
      category_id: detectCategory(title, description || ''),
      source_url: linkHref,
      source_name: 'LazioNascosto',
    });
  });

  return events;
}

const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

export async function runLazioNascostoScraper(): Promise<ScrapedEvent[]> {
  const results = await Promise.allSettled(MONTHS.map(m => scrapeMonthPage(m)));
  const all: ScrapedEvent[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }

  const currentYear = String(new Date().getFullYear());
  const seen = new Set<string>();
  return all.filter(e => {
    if (!e.date.startsWith(currentYear)) return false;
    const key = e.title.toLowerCase().slice(0, 60) + e.date + e.city;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
