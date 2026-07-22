import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE_URL = 'https://www.luogoarte.it/immersioni-sonore.html';

const MONTHS_IT: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

export async function runLuogoArteScraper(): Promise<ScrapedEvent[]> {
  console.log('[LuogoArte] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  try {
    const res = await axios.get(BASE_URL, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);
    const fullText = $('body').text();
    const currentYear = new Date().getFullYear();

    const concertRegex = /CONCERTO\s+DEL\s+(\d{1,2})\s+(\w+)\s+(\d{4})\s*(?:ORE\s*(\d{1,2})[.:](\d{2}))?/gi;
    let match;

    while ((match = concertRegex.exec(fullText)) !== null) {
      const day = match[1].padStart(2, '0');
      const monthName = match[2].toLowerCase();
      const yr = parseInt(match[3]);
      const monthNum = MONTHS_IT[monthName];
      if (!monthNum) continue;
      if (yr < currentYear) continue;

      const time = match[4] ? `${match[4].padStart(2, '0')}:${match[5]}` : undefined;
      const date = `${yr}-${monthNum}-${day}`;

      const timeMs = new Date(date).getTime();
      if (timeMs < Date.now()) continue;

      const surrounding = fullText.substring(Math.max(0, match.index - 500), match.index + 500);
      const titleMatch = surrounding.match(/CONCERTO\s+DEL.*?(?:ORE\s*\d{1,2}[.:]\d{2})?\s*([\s\S]*?)(?=CONCERTO\s+DEL|RASSEGNA\s+STAMPA|CATALOGO|$)/i);
      const rawTitle = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim().substring(0, 200) : `Concerto Immersioni Sonore ${day}/${monthNum}/${yr}`;
      const title = rawTitle.length > 5 ? rawTitle : `Concerto Immersioni Sonore ${day}/${monthNum}/${yr}`;

      const key = title.toLowerCase().slice(0, 60) + date;
      if (seen.has(key)) continue;
      seen.add(key);

      all.push({
        title: title.substring(0, 200),
        description: surrounding.trim().substring(0, 500) || title,
        date,
        time,
        location: 'Quarto Chiosco da Umberto, Lungomare di Latina',
        city: 'Latina',
        province: 'LT',
        category_id: 'mare',
        image_url: undefined,
        source_url: BASE_URL,
        source_name: 'LuogoArte - Immersioni Sonore',
      });
    }

    console.log(`[LuogoArte] Scraped ${BASE_URL}`);
  } catch (err: any) {
    console.error(`[LuogoArte] Error: ${err.message?.slice(0, 100)}`);
  }

  console.log(`[LuogoArte] Total: ${all.length} unique events`);
  return all;
}
