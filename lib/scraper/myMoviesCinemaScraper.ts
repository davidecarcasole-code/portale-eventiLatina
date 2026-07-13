import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const CINEMA_LISTING = 'https://www.mymovies.it/cinema/latina/programmazione/';

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function parseDateFromText(text: string): string | null {
  const today = new Date();
  const todayISO = getTodayISO();
  
  const lower = text.toLowerCase();
  if (lower.includes('oggi')) return getTodayISO();
  if (lower.includes('domani')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
  }
  
  const monthNames = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  const monthMatch = text.match(/(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i);
  if (monthMatch) {
    const day = monthMatch[1].padStart(2,'0');
    const monthIdx = monthNames.indexOf(monthMatch[2].toLowerCase());
    if (monthIdx >= 0) {
      const month = String(monthIdx + 1).padStart(2,'0');
      const year = new Date().getFullYear();
      return `${year}-${month}-${monthMatch[1].padStart(2,'0')}`;
    }
  }
  
  return null;
}

export async function scrapeMYMoviesCinema(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const todayISO = getTodayISO();

  try {
    const res = await axios.get(CINEMA_LISTING, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);

    console.log('[MYmovies] Page title:', $('title').text());
    console.log('[MYmovies] Page length:', res.data.length);

    // The film titles are in links with pattern: //www.mymovies.it/cinema/latina/provincia/?f=XXXXX
    // They appear as <a href="//www.mymovies.it/cinema/latina/provincia/?f=XXXXX">Film Title</a>
    
    const filmLinks = $('a[href*="/cinema/latina/provincia/?f="]');
    console.log(`[MYmovies] Found ${filmLinks.length} film links`);

    filmLinks.each((_, el) => {
      try {
        const $link = $(el);
        const title = $link.text().trim();
        const href = $link.attr('href');
        
        if (!title || title.length < 3) return;

        // Skip navigation links
        if (title.includes('Accedi') || title.includes('Esci') || title.includes('Provincia') || 
            title.includes('Cerca') || title.includes('Lingua') || title.includes('Film al cinema') ||
            title.includes('Eventi al cinema') || title.includes('Eventi Nexo') || title.includes('Cerca')) {
          return;
        }

        // Extract film ID from URL
        const filmIdMatch = href?.match(/[?&]f=(\d+)/);
        const filmId = filmIdMatch ? filmIdMatch[1] : null;

        // Only add if not already added (avoid duplicates)
        const existing = events.find(e => e.title === title);
        if (existing) return;

        console.log(`[MYmovies] Found film: ${title}`);

        events.push({
          title: title.slice(0, 200),
          description: `Proiezione al cinema`,
          date: getTodayISO(),
          time: undefined,
          location: 'Cinema Latina',
          city: 'Latina',
          province: 'LT',
          image_url: undefined,
          source_url: `https://www.mymovies.it/cinema/latina/programmazione/`,
          source_name: 'MYmovies.it',
          category_id: 'cinema',
        });
      } catch (err) {
      }
    });

    // Also check for film titles in other link patterns
    $('a[href*="/film/"]').each((_, el) => {
      try {
        const $link = $(el);
        const title = $link.text().trim();
        const href = $link.attr('href');
        
        if (!title || title.length < 3) return;
        if (title.includes('Accedi') || title.includes('Esci') || title.includes('Film')) return;

        // Only add if not already present
        const existing = events.find(e => e.title === title);
        if (existing) return;

        console.log(`[MYmovies] Found film link: ${title}`);
        
        events.push({
          title: title.slice(0, 200),
          description: `Proiezione al cinema`,
          date: getTodayISO(),
          time: undefined,
          location: 'Cinema Latina',
          city: 'Latina',
          province: 'LT',
          image_url: undefined,
          source_url: `https://www.mymovies.it${href}`,
          source_name: 'MYmovies.it',
          category_id: 'cinema',
        });
      } catch (err) {
      }
    });

    console.log(`[MYmovies Cinema] Found ${events.length} events for today`);
  } catch (err: any) {
    console.error('[MYmovies Cinema] Error:', err.message);
    console.error('[MYmovies Cinema] Stack:', err.stack);
  }

  return events.filter(e => e.date === getTodayISO());
}

export async function runMYMoviesCinemaScraper(): Promise<ScrapedEvent[]> {
  console.log('[MYmovies Cinema] Starting scraper for TODAY only...');
  return scrapeMYMoviesCinema();
}