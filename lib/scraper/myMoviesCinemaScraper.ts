import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedEvent } from './scraped-event';

const BASE = 'https://www.mymovies.it';
const CINEMA_LISTING = `${BASE}/cinema/latina`;

const MONTHS: Record<string, string> = {
  'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
  'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
  'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12',
};

async function scrapeMYMoviesCinema(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  try {
    const res = await axios.get(CINEMA_LISTING, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);

    // First pass: look for film cards
    $('.film-card, .movie-card, .scheda-film, [class*="film"]').each((_, el) => {
      try {
        const $card = $(el);
        
        const title = $card.find('h3, h2, .title, .film-title, [class*="title"]').first().text().trim();
        if (!title) return;

        const description = $card.find('.description, .synopsis, .trama, p').first().text().trim();
        const cinemaName = $card.find('.cinema, .sala, .theater, [class*="cinema"]').first().text().trim() || 'Cinema Latina';
        const timeText = $card.find('.orario, .time, .showtime, .orari').text().trim();
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        const imageUrl = $card.find('img').first().attr('src') || $card.find('img').first().attr('data-src');

        const detailLink = $card.find('a').first().attr('href');
        let sourceUrl = detailLink ? (detailLink.startsWith('http') ? detailLink : `https://www.mymovies.it${detailLink}`) : CINEMA_LISTING;

        events.push({
          title: title.slice(0, 200),
          description: description ? description.slice(0, 2000) : `Proiezione di "${title}" al ${cinemaName}`,
          date: dateStr,
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
        // Skip this card
      }
    });

    // Fallback: look for schedule tables
    if (events.length === 0) {
      $('.schedule-table, .programmazione-table, table.film').each((_, table) => {
        const $table = $(table);
        $table.find('tr').each((_, row) => {
          const $row = $(row);
          const cells = $row.find('td, th');
          if (cells.length >= 2) {
            const title = cells.eq(0).text().trim();
            const time = cells.eq(1).text().trim();
            if (title && title.length > 3) {
events.push({
                title: title.slice(0, 200),
                description: `Proiezione al cinema`,
                date: new Date().toISOString().split('T')[0],
                time: time,
                location: 'Cinema Latina',
                city: 'Latina',
                province: 'LT',
                source_url: CINEMA_LISTING,
                source_name: 'MYmovies.it',
                category_id: 'cinema',
              });
            }
          }
        });
      });
    }

    console.log(`[MYmovies Cinema] Found ${events.length} events`);
  } catch (err: any) {
    console.error('[MYmovies Cinema] Error:', err.message);
  }

  return events;
}

export async function runMYMoviesCinemaScraper(): Promise<ScrapedEvent[]> {
  console.log('[MYmovies Cinema] Starting scraper...');
  return scrapeMYMoviesCinema();
}