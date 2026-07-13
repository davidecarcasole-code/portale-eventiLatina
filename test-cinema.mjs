import axios from 'axios';
import * as cheerio from 'cheerio';

async function scrapeMYMoviesCinema() {
  const events = [];

  try {
    const res = await axios.get('https://www.mymovies.it/cinema/latina/programmazione/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);
    console.log('[MYmovies] Page title:', $('title').text());
    console.log('[MYmovies] Page length:', res.data.length);

    const filmLinks = $('a[href*="/cinema/latina/provincia/?f="]');
    console.log('[MYmovies] Found', filmLinks.length, 'film links');

    const seen = new Set();

    filmLinks.each((_, el) => {
      try {
        const $link = $(el);
        const title = $link.text().trim();
        const href = $link.attr('href');

        if (!title || title.length < 3) return;

        if (title.includes('Accedi') || title.includes('Esci') || title.includes('Provincia') || 
            title.includes('Cerca') || title.includes('Lingua') || title.includes('Film al cinema') ||
            title.includes('Eventi al cinema') || title.includes('Eventi Nexo') || title.includes('Cerca')) {
          return;
        }

        if (seen.has(title)) return;
        seen.add(title);

        const $parent = $link.closest('div, li, article, section, td, tr, .card, .item, .film');
        const parentText = $parent.text();
        
        let timeText = undefined;
        const timeSelectors = ['.orario', '.time', '.showtime', '.orari', '.ora', '.schedule', '.orari-spettacolo'];
        for (const sel of timeSelectors) {
          const timeEl = $link.closest('*').find(sel).first();
          if (timeEl.length > 0) {
            timeText = timeEl.text().trim();
            break;
          }
        }

        let cinemaName = 'Cinema Latina';
        const cinemaSelectors = ['.cinema', '.sala', '.theater', '[class*="cinema"]', '[class*="sala"]', '.location', '.luogo'];
        for (const sel of cinemaSelectors) {
          const cinemaEl = $link.closest('*').find(sel).first();
          if (cinemaEl.length > 0) {
            cinemaName = cinemaEl.text().trim() || 'Cinema Latina';
            break;
          }
        }

        console.log('[MYmovies] Found film:', title);

        events.push({
          title: title.slice(0, 200),
          description: 'Proiezione al cinema',
          date: new Date().toISOString().split('T')[0],
          time: timeText,
          location: 'Cinema Latina',
          city: 'Latina',
          province: 'LT',
          image_url: undefined,
          source_url: 'https://www.mymovies.it/cinema/latina/programmazione/',
          source_name: 'MYmovies.it',
          category_id: 'cinema',
        });
      } catch (err) {
      }
    });

    console.log('[MYmovies] Total unique films:', events.length);
  } catch (err) {
    console.error('[MYmovies Cinema] Error:', err.message);
    console.error('[MYmovies] Stack:', err.stack);
  }

  const todayISO = new Date().toISOString().split('T')[0];
  return events.filter(e => e.date === todayISO);
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

async function main() {
  const events = await scrapeMYMoviesCinema();
  console.log('\n=== EVENTS FOUND ===');
  if (events.length === 0) {
    console.log('No events found for today');
  } else {
    events.forEach(e => console.log('-', e.title, '|', e.location, '|', e.time || 'N/A'));
  }
}

main().catch(console.error);