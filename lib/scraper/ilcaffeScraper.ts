import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://ilcaffe.tv';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

const MONTHS_ABBR: Record<string, string> = {
  gen: '01', feb: '02', mar: '03', apr: '04', mag: '05', giu: '06',
  lug: '07', ago: '08', set: '09', ott: '10', nov: '11', dic: '12',
};

function parseItalianDate(text: string): string | null {
  if (!text) return null;
  const patterns: RegExp[] = [
    /(\d{1,2})\s*(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s*(\d{4})/i,
    /(\d{1,2})\s*(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\s*(\d{4})/i,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
  ];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (!m) continue;
    if (pattern === patterns[0] || pattern === patterns[1]) {
      const monthKey = m[2].toLowerCase();
      const month = MONTHS_IT[monthKey] || MONTHS_ABBR[monthKey];
      if (!month) continue;
      return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
    }
    if (m[1].length === 4) return `${m[1]}-${m[2]}-${m[3]}`;
    return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return null;
}

function extractCity(text: string): string | null {
  const knownCities: [string, string][] = [
    ['aprilia', 'Aprilia'], ['cisterna', 'Cisterna'], ['terracina', 'Terracina'],
    ['sabaudia', 'Sabaudia'], ['san felice circeo', 'San Felice Circeo'],
    ['circeo', 'San Felice Circeo'], ['fondi', 'Fondi'], ['formia', 'Formia'],
    ['gaeta', 'Gaeta'], ['sperlonga', 'Sperlonga'], ['pontinia', 'Pontinia'],
    ['sermoneta', 'Sermoneta'], ['sezze', 'Sezze'], ['priverno', 'Priverno'],
    ['cori', 'Cori'], ['norma', 'Norma'], ['bassiano', 'Bassiano'],
    ['maenza', 'Maenza'], ['roccagorga', 'Roccagorga'], ['prossedi', 'Prossedi'],
    ['sonnino', 'Sonnino'], ['monte san biagio', 'Monte San Biagio'],
    ['lenola', 'Lenola'], ['itri', 'Itri'], ['minturno', 'Minturno'],
    ['castelforte', 'Castelforte'], ['ventotene', 'Ventotene'],
    ['ponza', 'Ponza'], ['nettuno', 'Nettuno'], ['anzio', 'Anzio'],
    ['pomezia', 'Pomezia'], ['latina', 'Latina'],
  ];
  const lower = text.toLowerCase();
  for (const [search, display] of knownCities) {
    if (lower.includes(search)) return display;
  }
  return null;
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/concerto|musica|live|dj set|band|orchestra|cantante|festival musicale/)) return 'musica';
  if (lower.match(/teatro|commedia|opera|balletto/)) return 'teatro';
  if (lower.match(/cinema|film|proiezione|screening/)) return 'cinema';
  if (lower.match(/mostra|museo|arte|cultura|fotografia|pittura|scultura/)) return 'cultura';
  if (lower.match(/bambini|kids|famiglia|laboratorio|animazione|ragazzi|ludoteca/)) return 'bambini';
  if (lower.match(/sport|corsa|gara|ciclismo|podismo|maratona|torneo|basket|calcio/)) return 'sport';
  if (lower.match(/sagra|enogastronomia|cibo|vino|food|degustazione|street food/)) return 'enogastronomia';
  if (lower.match(/natura|escursione|trekking|passeggiata|parco|giardino/)) return 'natura';
  if (lower.match(/mare|spiaggia|balneare|lido|bagni|costa|spiaggia|litorale/)) return 'mare';
  if (lower.match(/yoga|benessere|wellness|meditazione/)) return 'benessere';
  if (lower.match(/fiera|villaggio|mercatino/)) return 'spettacolo';
  return 'spettacolo';
}

function parseArticlePage($: cheerio.CheerioAPI): { date: string | null; description: string } {
  const articleBody = $('.entry-content').first().text().trim();
  const description = articleBody ? articleBody.slice(0, 800) : '';

  let date = description ? parseItalianDate(description) : null;

  if (!date) {
    const pubTime = $('meta[property="article:published_time"]').attr('content')
      || $('meta[name="article:published_time"]').attr('content');
    if (pubTime) date = pubTime.split('T')[0];
  }

  return { date, description };
}

export async function runIlCaffeScraper(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  const urls = [
    `${BASE}/latina/eventi/`,
    `${BASE}/aprilia/eventi/`,
    `${BASE}/anzio-nettuno/eventi/`,
  ];

  const linksToVisit: { title: string; href: string; summary: string; subtitle: string }[] = [];

  for (const pageUrl of urls) {
    try {
      const res = await axios.get(pageUrl, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      const $ = cheerio.load(res.data);

      $('article.ilc_articolo').each((_i, el) => {
        const $el = $(el);
        const subtitle = $el.find('h3.ilc_articolo_subtitle').first().text().trim();
        const title = $el.find('h2.ilc_articolo_title').first().text().trim();
        const summary = $el.find('div.ilc_articolo_sommario').first().text().trim();
        const href = $el.find('a[href*="/articolo/"]').first().attr('href') || '';

        if (!title || !href || href.includes('/pr/')) return;

        const dedupKey = title.toLowerCase().slice(0, 80);
        if (seen.has(dedupKey)) return;
        seen.add(dedupKey);

        linksToVisit.push({ title, href, summary, subtitle });
      });
    } catch (err: any) {
      if (err?.response?.status !== 429) {
        console.error(`[IlCaffeScraper] Error fetching "${pageUrl}": ${err.message}`);
      }
    }
  }

  for (const item of linksToVisit) {
    try {
      const res = await axios.get(item.href, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      const $ = cheerio.load(res.data);
      const { date: pageDate, description: pageDesc } = parseArticlePage($);
      const description = pageDesc || item.summary;
      const combined = `${item.title} ${item.subtitle} ${item.summary} ${description}`;

      let date = pageDate;
      if (!date) date = parseItalianDate(combined);
      if (!date) date = new Date().toISOString().split('T')[0];

      const city = extractCity(combined);
      const category = detectCategory(combined);

      events.push({
        title: item.title.slice(0, 200),
        description: description.slice(0, 500) || undefined,
        date,
        city: city || 'Latina',
        category_id: category,
        source_url: item.href,
        source_name: 'Il Caffè TV',
      });
    } catch (err: any) {
      console.error(`[IlCaffeScraper] Error fetching article: ${err.message?.slice(0, 100)}`);
    }
  }

  return events;
}
