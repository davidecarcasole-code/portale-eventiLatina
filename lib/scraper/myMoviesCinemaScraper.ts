import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.mymovies.it';
const CINEMA_LISTING = `${BASE}/cinema/latina`;

async function scrapeMYMoviesCinema(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  try {
    const res = await axios.get(CINEMA_LISTING, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);

    // Debug: log page title and some structure
    console.log('[MYmovies] Page title:', $('title').text());
    console.log('[MYmovies] Body classes:', $('body').attr('class'));
    console.log('[MYmovies] Main containers:', $('.container, main, #main, #content, .content, .wrapper').length);

    // Try multiple selector patterns for film cards
    const filmSelectors = [
      '.film-card',
      '.movie-card', 
      '.scheda-film',
      '.film-item',
      '.movie-item',
      '.movie',
      '.film',
      '.scheda',
      '.card-film',
      '[class*="film"]',
      '[class*="movie"]',
      '.grid-item',
      '.list-item',
      'article',
      '.event-item',
      '.evento'
    ];

    let foundCards = false;

    for (const selector of filmSelectors) {
      const cards = $(selector);
      if (cards.length > 0) {
        console.log(`[MYmovies] Found ${cards.length} cards with selector: ${selector}`);
        foundCards = true;
        
        cards.each((_, el) => {
          try {
            const $card = $(el);
            
            // Try multiple title selectors
            const title = $card.find('h1, h2, h3, h4, .title, .film-title, .movie-title, .titolo, .name, h3 a, h2 a').first().text().trim();
            if (!title || title.length < 3) return;

            const description = $card.find('.description, .synopsis, .trama, .plot, .description, p').first().text().trim();
            const cinemaName = $card.find('.cinema, .sala, .theater, [class*="cinema"], [class*="sala"], .location, .luogo').first().text().trim() || 'Cinema Latina';
            const timeText = $card.find('.orario, .time, .showtime, .orari, .ora, .schedule, .orari-spettacolo').first().text().trim();
            
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];

            const imageUrl = $card.find('img').first().attr('src') || $card.find('img').first().attr('data-src') || $card.find('img').first().attr('data-lazy');

            const detailLink = $card.find('a[href*="/film/"], a[href*="/scheda/"], a[href*="/film/"]').first().attr('href') || 
                              $card.find('a').first().attr('href');
            let sourceUrl = detailLink ? (detailLink.startsWith('http') ? detailLink : `https://www.mymovies.it${detailLink}`) : 'https://www.mymovies.it/cinema/latina';

            events.push({
              title: title.slice(0, 200),
              description: description ? description.slice(0, 2000) : `Proiezione di "${title}" al ${cinemaName}`,
              date: new Date().toISOString().split('T')[0],
              time: timeText || undefined,
              location: cinemaName,
              city: 'Latina',
              province: 'LT',
              image_url: imageUrl || undefined,
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

    // Fallback: look for any links with film-related paths
    if (events.length === 0) {
      console.log('[MYmovies] Trying fallback: all links with /film/ or /scheda/');
      $('a[href*="/film/"], a[href*="/scheda/"]').each((_, el) => {
        try {
          const $link = $(el);
          const title = $link.text().trim() || $link.attr('title')?.trim();
          if (!title || title.length < 3) return;
          
          // Try to find parent container for context
          const $parent = $link.closest('div, article, li, tr, .card, .item');
          
          const description = $parent.find('p, .desc, .trama, .description').first().text().trim();
          const timeText = $parent.find('.orario, .time, .showtime, .orari, .ora').first().text().trim();
          
          const titleClean = title.slice(0, 200);
          if (titleClean.length < 3) return;

          events.push({
            title: titleClean,
            description: description ? description.slice(0, 2000) : `Proiezione di "${titleClean}"`,
            date: new Date().toISOString().split('T')[0],
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

    console.log(`[MYmovies Cinema] Found ${events.length} events`);
  } catch (err: any) {
    console.error('[MYmovies Cinema] Error:', err.message);
    console.error('[MYmovies Cinema] Stack:', err.stack);
  }

  return events;
}

export async function runMYMoviesCinemaScraper(): Promise<ScrapedEvent[]> {
  console.log('[MYmovies Cinema] Starting scraper...');
  return scrapeMYMoviesCinema();
}