import axios from 'axios';
import { ScrapedEvent } from './scraped-event';

const SEARCH_QUERIES = [
  'eventi oggi Latina provincia 2026',
  'concerti estate Latina 2026',
  'feste sagre Latina provincia 2026',
  'eventi al mare Latina 2026',
  'spettacoli teatro Latina 2026',
  'mostre musei Latina 2026',
  'musica dal vivo Latina 2026',
  'mercatini feste paese Latina 2026',
  'cose da fare Latina weekend 2026',
  'eventi gratuiti Latina 2026',
  'concerti stabilimenti balneari Latina 2026',
  'feste paesane provincia Latina 2026',
];

const MONTHS: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

function parseItalianDate(text: string): string | null {
  const patterns = [
    /(\d{1,2})\s*(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s*(\d{4})/i,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
  ];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (!m) continue;
    if (pattern === patterns[0]) {
      const month = MONTHS[m[2].toLowerCase()];
      if (!month) continue;
      return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
    }
    if (m[1].length === 4) return `${m[1]}-${m[2]}-${m[3]}`;
    return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return null;
}

function extractCity(text: string): string | null {
  const knownCities = ['latina', 'aprilia', 'cisterna', 'terracina', 'sabaudia',
    'san felice circeo', 'fondi', 'formia', 'gaeta', 'sperlonga', 'pontinia',
    'sermoneta', 'sezze', 'priverno', 'cori', 'norma', 'bassiano', 'maenza',
    'roccagorga', 'prossedi', 'sonnino', 'monte san biagio', 'lenola', 'itri',
    'minturno', 'castelforte', 'ventotene', 'ponza'];
  const lower = text.toLowerCase();
  for (const city of knownCities) {
    if (lower.includes(city)) return city.charAt(0).toUpperCase() + city.slice(1);
  }
  return null;
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/concerto|musica|live|dj set|band|orchestra|cantante|festival musicale/)) return 'musica';
  if (lower.match(/teatro|spettacolo|commedia|dramma|opera|balletto/)) return 'teatro';
  if (lower.match(/cinema|film|proiezione|screening/)) return 'cinema';
  if (lower.match(/mostra|museo|arte|cultura|fotografia|pittura|scultura/)) return 'cultura';
  if (lower.match(/bambini|kids|famiglia|laboratorio|animazione/)) return 'bambini';
  if (lower.match(/sport|corsa|gara|ciclismo|podismo|maratona|torneo/)) return 'sport';
  if (lower.match(/sagra|enogastronomia|cibo|vino|food|degustazione/)) return 'enogastronomia';
  if (lower.match(/natura|escursione|trekking|passeggiata|parco|giardino/)) return 'natura';
  if (lower.match(/mare|spiaggia|balneare|lido|bagni/)) return 'mare';
  if (lower.match(/mostra mercato|mercatino|fiera/)) return 'spettacolo';
  if (lower.match(/yoga|benessere|wellness|meditazione/)) return 'benessere';
  return 'spettacolo';
}

export async function runGoogleSearchScraper(): Promise<ScrapedEvent[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;
  const useMock = !apiKey || !cx;

  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  for (const query of SEARCH_QUERIES) {
    try {
      let results: any[] = [];

      if (useMock) {
        continue;
      } else {
        const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: { key: apiKey, cx, q: query, lr: 'lang_it', num: 10 },
          timeout: 15000,
        });
        results = res.data.items || [];
      }

      for (const item of results) {
        const title = item.title;
        const snippet = item.snippet || '';
        const link = item.link;

        if (!title || seen.has(title.toLowerCase().slice(0, 80))) continue;
        seen.add(title.toLowerCase().slice(0, 80));

        const combined = title + ' ' + snippet;
        const date = parseItalianDate(combined);
        const city = extractCity(combined);

        events.push({
          title: title.slice(0, 200),
          description: snippet.slice(0, 1000) || undefined,
          date: date || new Date().toISOString().split('T')[0],
          city: city || 'Latina',
          category_id: detectCategory(combined),
          source_url: link,
          source_name: 'Google Search',
        });
      }
    } catch (err: any) {
      if (err?.response?.status !== 429) {
        console.error(`[GoogleSearch] Error for "${query}": ${err.message}`);
      }
    }
  }

  return events;
}
