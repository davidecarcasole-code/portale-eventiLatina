import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const URL = 'https://www.orangogo.it/centri-estivi/summer-fun-by-kids-us-centro-estivo-in-inglese-kids-us-latina-latina';

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/bambini|kids|campus|giochi|famiglia|estivo|ragazzi/.test(lower)) return 'bambini';
  if (/sport|gara|corsa/.test(lower)) return 'sport';
  if (/natura|parco|riserva/.test(lower)) return 'natura';
  return 'bambini';
}

export async function runOrangogoScraper(): Promise<ScrapedEvent[]> {
  console.log('[OrangoGo] Starting...');
  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  try {
    const res = await axios.get(URL, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);

    const title = $('h1, .entry-title, [class*="title"]').first().text().trim() || 'Summer Fun by Kids Us - Centro Estivo in Inglese';
    const bodyText = $('article, .entry-content, main, [class*="content"]').first().text().trim();

    const dateMatch = bodyText.match(/(?:dal|dal)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(?:al|fino al|al)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i);
    const year = new Date().getFullYear();
    const months: Record<string, string> = {
      gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
      maggio: '05', giugno: '06', luglio: '07', agosto: '08',
      settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
    };

    let startDate = new Date().toISOString().split('T')[0];
    if (dateMatch) {
      const startMonth = months[dateMatch[2].toLowerCase()];
      const startDay = dateMatch[1].padStart(2, '0');
      startDate = `${year}-${startMonth}-${startDay}`;
    } else {
      const simpleDate = bodyText.match(/(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i);
      if (simpleDate) {
        const m = months[simpleDate[2].toLowerCase()];
        startDate = `${year}-${m}-${simpleDate[1].padStart(2, '0')}`;
      }
    }

    const description = bodyText.substring(0, 500).replace(/\s+/g, ' ').trim();

    const key = title.toLowerCase().slice(0, 60) + startDate;
    if (!seen.has(key)) {
      seen.add(key);
      all.push({
        title: title.substring(0, 200),
        description: description || undefined,
        date: startDate,
        city: 'Latina',
        province: 'LT',
        category_id: detectCategory(title),
        source_url: URL,
        source_name: 'OrangoGo',
      });
    }

    console.log(`[OrangoGo] Found ${all.length} events`);
  } catch (err: any) {
    console.error(`[OrangoGo] Error: ${err.message?.slice(0, 200)}`);
  }

  console.log(`[OrangoGo] Total: ${all.length} events`);
  return all;
}
