import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.mymovies.it';
const CINEMA_LISTING = `${BASE}/cinema/latina`;

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function parseDateFromText(text: string): string | null {
  const today = new Date();
  const todayISO = getTodayISO();
  
  // Look for patterns like "oggi", "domani", or specific dates
  const lower = text.toLowerCase();
  if (lower.includes('oggi')) return getTodayISO();
  if (lower.includes('domani')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Try to extract dd/mm/yyyy or dd-mm-yyyy
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
  }
  
  // Try "dd mese" format (e.g., "15 dicembre")
  const monthNames = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  const monthMatch = text.match(/(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i);
  if (monthMatch) {
    const day = monthMatch[1].padStart(2,'0');
    const monthIdx = monthNames.indexOf(monthMatch[2].toLowerCase());
    if (monthIdx >= 0) {
      const month = String(monthIdx + 1).padStart(2,'0');
      const year = new Date().getFullYear();
      return `${year}-${month}-${day}`;
    }
  }
  
  return null;
}

async function scrapeMYMoviesCinema(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const todayISO = getTodayISO();

  try {
    const res = await axios.get('https://www.mymovies.it/cinema/latina', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);

    console.log('[MYmovies] Page title:', $('title').text());
    console.log('[MYmovies] Body classes:', $('body').attr('class'));

    const filmSelectors = [
      '.film-card', '.movie-card', '.scheda-film', '.film-item', '.movie-item',
      '.movie', '.film', '.scheda', '.card-film', '[class*="film"]', '[class*="movie"]',
      '.grid-item', '.list-item', 'article', '.event-item', '.evento',
      '.programma-film', '.film-in-programmazione', '.film-in-sala'
    ];

    let foundEvents = false;

    for (const selector of filmSelectors) {
      const cards = $(selector);
      if (cards.length > 0) {
        console.log(`[MYmovies] Found ${cards.length} cards with selector: ${selector}`);
        
        cards.each((_, el) => {
          try {
            const $card = $(el);
            
            // Try multiple title selectors
            const title = $card.find('h1, h2, h3, h4, .title, .film-title, .movie-title, .titolo, .name, h3 a, h2 a, a').first().text().trim();
            if (!title || title.length < 3) return;

            // Try to extract date from the card
            const cardText = $card.text();
            let eventDate = parseDateFromText($card.text()) || getTodayISO();
            
            // Only keep events for TODAY
            if (eventDate !== getTodayISO()) {
              console.log(`[MYmovies] Skipping "${title}" - date is ${eventDate}, not today`);
              return;
            }

            const description = $card.find('.description, .synopsis, .trama, .plot, .description, p').first().text().trim();
            const cinemaName = $card.find('.cinema, .sala, .theater, [class*="cinema"], [class*="sala"], .location, .luogo').first().text().trim() || 'Cinema Latina';
            const timeText = $card.find('.orario, .time, .showtime, .orari, .ora, .schedule, .orari-spettacolo').first().text().trim();
            
            const imageUrl = $card.find('img').first().attr('src') || $card.find('img').first().attr('data-src') || $card.find('img').first().attr('data-lazy');

            const detailLink = $card.find('a[href*="/film/"], a[href*="/scheda/"]').first().attr('href') || 
                               $card.find('a').first().attr('href');
            let sourceUrl = detailLink ? (detailLink.startsWith('http') ? detailLink : `https://www.mymovies.it${detailLink}`) : 'https://www.mymovies.it/cinema/latina';

            events.push({
              title: title.slice(0, 200),
              description: description ? description.slice(0, 2000) : `Proiezione di "${title}" al ${cinemaName}`,
              date: eventDate,
              time: timeText || undefined,
              location: cinemaName,
              city: 'Latina',
              province: 'LT',
              image_url: undefined,
              source_url: sourceUrl,
              source_name: 'MYmovies.it',
              category_id: 'cinema',
            });
          } catch (err) {
          }
        });
        
        if (events.length > 0) break;
      }
    }

    // Fallback: try to find any film links and extract dates from nearby context
    if (events.length === 0) {
      console.log('[MYmovies] Trying fallback: all links with /film/ or /scheda/');
      $('a[href*="/film/"], a[href*="/scheda/"]').each((_, el) => {
        try {
          const $link = $(el);
          const title = $link.text().trim() || $link.attr('title')?.trim();
          if (!title || title.length < 3) return;
          
          const $parent = $link.closest('div, article, li, tr, .card, .item, .film, .movie, .scheda');
          const parentText = $parent.text();
          const eventDate = parseDateFromText(parentText) || getTodayISO();
          
          // Only today
          if (eventDate !== getTodayISO()) return;
          
          const timeText = $parent.find('.orario, .time, .showtime, .orari, .ora').first().text().trim();
          
          events.push({
            title: title.slice(0, 200),
            description: `Proiezione di "${title}"`,
            date: getTodayISO(),
            time: timeText || undefined,
            location: 'Cinema Latina',
            city: 'Latina',
            province: 'LT',
            source_url: 'https://www.mymovies.it/cinema/latina',
            source_name: 'MYmovies.it',
            category_id: 'cinema',
          });
        } catch (err) {
        }
      });
    }

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