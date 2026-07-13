import * as cheerio from 'cheerio';
import axios from 'axios';
import { ScrapedEvent } from './scraped-event';

const MONTHS_MAP: Record<string, string> = {
  'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
  'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
  'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12',
};

function detectCategory(title: string, kicker: string): string {
  const k = kicker.toLowerCase();
  if (k.includes('concerti') || k.includes('musica')) return 'cat_music';
  if (k.includes('teatro')) return 'cat_theater';
  if (k.includes('cinema')) return 'cat_cinema';
  if (k.includes('mostra') || k.includes('cultura')) return 'cat_culture';
  if (k.includes('sport')) return 'cat_sports';
  if (k.includes('natura')) return 'cat_nature';
  if (k.includes('enogastronomia') || k.includes('sagra')) return 'cat_food';
  if (k.includes('bambini')) return 'cat_kids';
  if (k.includes('mercatini') || k.includes('fiera') || k.includes('manifestazioni')) return 'cat_entertainment';
  if (k.includes('benessere')) return 'cat_benessere';
  if (k.includes('salute')) return 'cat_salute';
  if (k.includes('donna') || k.includes('rosa')) return 'cat_rosa';
  const t = title.toLowerCase();
  if (/concerto|musica|dj|band|rock|jazz|cantante|festival|coro/.test(t)) return 'cat_music';
  if (/teatro|danza|spettacolo/.test(t)) return 'cat_theater';
  if (/cinema|film|documentario|proiezione|rassegna|cinemateca|cineforum/.test(t)) return 'cat_cinema';
  if (/mostra|museo|arte|cultura|fotografia|conferenza|libro/.test(t)) return 'cat_culture';
  if (/sport|gara|maratona|bici/.test(t)) return 'cat_sports';
  if (/natura|parco|giardino|lago|riserva/.test(t)) return 'cat_nature';
  if (/trekking|passeggiata|escursione/.test(t)) return 'cat_trekking';
  if (/sagra|vino|cibo|enogastronomia|street food/.test(t)) return 'cat_food';
  if (/bambini|famiglia|giochi/.test(t)) return 'cat_kids';
  if (/festa|mercatino|palio|rievocazione|carnevale/.test(t)) return 'cat_entertainment';
  if (/gita|borgo|castello|storico/.test(t)) return 'cat_daytrip';
  if (/mare|spiaggia|lido|bagno|costa|litorale|sabbia|nuoto|vela|windsurf|kitesurf|sub|immersione|porto|approdo/.test(t)) return 'cat_sea';
  if (/benessere|yoga|relax|spa|wellness|massaggi|meditazione|pilates/.test(t)) return 'cat_benessere';
  if (/salute|prevenzione|sanità|screening|medico|ospedale/.test(t)) return 'cat_salute';
  if (/donna|donne|femminile|rosa|8\s+marzo/.test(t)) return 'cat_rosa';
  return 'cat_entertainment';
}

function extractCity(title: string): { city: string; province: string } {
  const combined = title.toLowerCase();
  const locations: Array<{ name: string; prov: string }> = [
    { name: 'Sabaudia', prov: 'LT' }, { name: 'Gaeta', prov: 'LT' }, { name: 'Terracina', prov: 'LT' },
    { name: 'Fondi', prov: 'LT' }, { name: 'Formia', prov: 'LT' }, { name: 'Sperlonga', prov: 'LT' },
    { name: 'Cisterna', prov: 'LT' }, { name: 'Aprilia', prov: 'LT' }, { name: 'Pontinia', prov: 'LT' },
    { name: 'Priverno', prov: 'LT' }, { name: 'Cori', prov: 'LT' }, { name: 'Sezze', prov: 'LT' },
    { name: 'Sermoneta', prov: 'LT' }, { name: 'Norma', prov: 'LT' }, { name: 'San Felice Circeo', prov: 'LT' },
    { name: 'Minturno', prov: 'LT' }, { name: 'Maenza', prov: 'LT' }, { name: 'Roccagorga', prov: 'LT' },
    { name: 'Latina', prov: 'LT' },
    { name: 'Roma', prov: 'RM' }, { name: 'Tivoli', prov: 'RM' }, { name: 'Anzio', prov: 'RM' },
    { name: 'Nettuno', prov: 'RM' }, { name: 'Cerveteri', prov: 'RM' }, { name: 'Bracciano', prov: 'RM' },
    { name: 'Frosinone', prov: 'FR' }, { name: 'Cassino', prov: 'FR' }, { name: 'Anagni', prov: 'FR' },
    { name: 'Viterbo', prov: 'VT' }, { name: 'Tarquinia', prov: 'VT' }, { name: 'Bagnoregio', prov: 'VT' },
    { name: 'Nepi', prov: 'VT' }, { name: 'Rieti', prov: 'RI' },
  ];
  for (const loc of locations) {
    if (combined.includes(loc.name.toLowerCase())) return { city: loc.name, province: loc.prov };
  }
  return { city: 'Latina', province: 'LT' };
}

function extractDateFromJsonLd(html: string): { date: string; end_date?: string; location?: string; name?: string } | null {
  const $ = cheerio.load(html);
  let result: { date: string; end_date?: string; location?: string; name?: string } | null = null;

  $('script[type="application/ld+json"]').each((_i: number, el: any) => {
    if (result) return;
    try {
      const content = $(el).html() || '';
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item['@type'] === 'Event' && item.startDate) {
          const startDate = item.startDate.split('T')[0];
          const endDate = item.endDate ? item.endDate.split('T')[0] : undefined;
          const location = item.location?.name || item.location?.address?.addressLocality || '';
          result = { date: startDate, end_date: endDate, location, name: item.name };
          return;
        }
      }
    } catch { }
  });

  return result;
}

function extractDateFromTitle(title: string): { date: string; end_date?: string } | null {
  const lower = title.toLowerCase();
  const currentYear = new Date().getFullYear();

  const seasonMatch = lower.match(/da\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+a\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/);
  if (seasonMatch) {
    const m1 = MONTHS_MAP[seasonMatch[1]];
    const m2 = MONTHS_MAP[seasonMatch[2]];
    if (m1 && m2) {
      return { date: `${currentYear}-${m1}-01`, end_date: `${currentYear}-${m2}-01` };
    }
  }

  const diMatch = lower.match(/di\s+(giugno|luglio|agosto|settembre|maggio)/);
  if (diMatch) {
    const m = MONTHS_MAP[diMatch[1]];
    if (m) return { date: `${currentYear}-${m}-15` };
  }

  for (const [monthName, monthNum] of Object.entries(MONTHS_MAP)) {
    if (lower.includes(monthName)) {
      const dayMatch = lower.match(/(\d{1,2})\s*(giugno|luglio|agosto|settembre|maggio)/i);
      const day = dayMatch ? dayMatch[1].padStart(2, '0') : '15';
      return { date: `${currentYear}-${monthNum}-${day}` };
    }
  }

  return null;
}

async function scrapeDetailDates(url: string): Promise<{ date: string; end_date?: string; description?: string; location?: string } | null> {
  try {
    const res = await axios.get(url, {
      timeout: 12000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const $ = cheerio.load(res.data);

    const ldDate = extractDateFromJsonLd(res.data);
    if (ldDate?.date) return ldDate;

    const timeText = $('time').first().text().trim();
    if (timeText) {
      const m = timeText.match(/(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/);
      if (m) {
        const month = MONTHS_MAP[m[2]];
        if (month) return { date: `${m[3]}-${month}-${m[1].padStart(2, '0')}` };
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function scrapeListingPage(): Promise<ScrapedEvent[]> {
  let html: string;
  try {
    const res = await axios.get('https://www.latinatoday.it/eventi/', {
      timeout: 12000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    html = res.data;
  } catch (err: any) {
    console.error('[LatinaToday] fetch error:', err.message);
    return [];
  }

  const $ = cheerio.load(html);
  const cards: Array<{ title: string; link: string; kicker: string; img: string }> = [];

  $('.c-card, article').each((_i: number, el: any) => {
    const $el = $(el);
    const $link = $el.find('a[aria-label]');
    const href = $link.attr('href');
    const title = $link.attr('aria-label');
    if (!title || !href || title.length < 10) return;
    if (/LatinaToday|Facebook|Google|Apple|Ultime notizie|Cosa fare|Guide|Segnalazioni|Redazione|Privacy|Condizioni|Consensi|Dove Mangiare/.test(title)) return;
    const kicker = $el.find('.c-card__kicker').first().text().trim();
    const img = $el.find('img').first().attr('src') || '';
    const link = href.startsWith('http') ? href : `https://www.latinatoday.it${href}`;
    cards.push({ title: title.trim(), link, kicker, img });
  });

  if (cards.length === 0) {
    console.log('[LatinaToday] No event cards found');
    return [];
  }

  const seenTitles = new Set<string>();
  const uniqueCards = cards.filter(c => {
    const key = c.title.toLowerCase().slice(0, 50);
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  console.log(`[LatinaToday] ${uniqueCards.length} unique events, scraping details...`);

  const details = await Promise.allSettled(uniqueCards.map(c => scrapeDetailDates(c.link)));

  const events: ScrapedEvent[] = [];
  for (let i = 0; i < uniqueCards.length; i++) {
    const card = uniqueCards[i];
    const detailResult = details[i];
    const detail = detailResult.status === 'fulfilled' ? detailResult.value : null;

    let date = '';
    let endDate: string | undefined;
    let description: string | undefined;

    if (detail?.date) {
      date = detail.date;
      endDate = detail.end_date;
    } else {
      const titleDate = extractDateFromTitle(card.title);
      if (titleDate) {
        date = titleDate.date;
        endDate = titleDate.end_date;
      }
    }

    if (!date) {
      console.log(`[LatinaToday] Skip "${card.title.slice(0, 40)}" — no date`);
      continue;
    }

    const { city, province } = extractCity(card.title);

    events.push({
      title: card.title.substring(0, 200),
      description,
      date,
      end_date: endDate,
      time_period: 'intera_giornata',
      location: detail?.location || city,
      city,
      province,
      category_id: detectCategory(card.title, card.kicker),
      image_url: card.img ? card.img.startsWith('http') ? card.img : `https://www.latinatoday.it${card.img}` : undefined,
      source_url: card.link,
      source_name: 'LatinaToday',
    });
  }

  return events;
}

export async function runLatinaTodayScraper(): Promise<ScrapedEvent[]> {
  const events = await scrapeListingPage();
  const currentYear = String(new Date().getFullYear());
  const seen = new Set<string>();
  return events.filter(e => {
    if (!e.date.startsWith(currentYear)) return false;
    const key = e.title.toLowerCase().slice(0, 60) + e.city;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
