import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CinemaShowtime {
  cinemaName: string;
  cinemaSlug: string;
  filmTitle: string;
  filmDescription?: string;
  director?: string;
  genre?: string;
  year?: number;
  duration?: string;
  posterUrl?: string;
  trailerUrl?: string;
  showtimes: string[];
  sourceUrl: string;
}

function getTodayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
};

async function scrapeCinemaLatinaIt(): Promise<CinemaShowtime[]> {
  console.log('[CinemaScraper] Fetching cinemalatina.it...');
  const results: CinemaShowtime[] = [];

  try {
    const { data: html } = await axios.get('https://www.cinemalatina.it/', {
      headers: HEADERS,
      timeout: 15000,
    });
    const $ = cheerio.load(html);

    const today = getTodayISO();

    // Each film card is in a div inside #wk-grid971
    // The modal #wk-3971 has the detailed info with showtimes
    // Film titles are in the overlay bottom h3
    // Showtimes are in the modal slideshow

    // Parse the modal content for showtimes
    const modal = $('#wk-3971');
    const slides = modal.find('.uk-slideshow > li');

    slides.each((i, slide) => {
      const $slide = $(slide);
      const title = $slide.find('h3.uk-h2').first().text().trim();
      if (!title) return;

      const description = $slide.find('p').first().text().trim().slice(0, 2000);
      const durationMatch = $slide.text().match(/Durata:\s*(\d+\s*min)/);
      const duration = durationMatch ? durationMatch[1] : undefined;

      // Parse showtimes per cinema
      const showtimesByCinema: Record<string, string[]> = {};
      let currentCinema = '';

      $slide.find('h3.uk-h3, li').each((_, el) => {
        const text = $(el).text().trim();
        if ($(el).is('h3.uk-h3')) {
          currentCinema = text;
        } else if (currentCinema && text.startsWith('ORARI:')) {
          const times = text.replace('ORARI:', '').trim();
          if (times && currentCinema) {
            showtimesByCinema[currentCinema] = times.split(',').map(t => t.trim()).filter(Boolean);
          }
        }
      });

      // Get poster image
      const posterEl = $(`#wk-grid971 > div:eq(${i}) img`);
      const posterUrl = posterEl.attr('src') || undefined;

      // Get trailer link
      const trailerLink = $slide.find('a[href*="/trailer/"]').attr('href');
      const trailerUrl = trailerLink ? `https://www.cinemalatina.it${trailerLink}` : undefined;

      // Map cinema names to slugs
      const cinemaMap: Record<string, string> = {
        'Multisala Corso': 'multisala-corso',
        'Multisala Supercinema 2.0': 'supercinema',
      };

      for (const [cinemaName, times] of Object.entries(showtimesByCinema)) {
        const slug = cinemaMap[cinemaName] || cinemaName.toLowerCase().replace(/\s+/g, '-');
        results.push({
          cinemaName,
          cinemaSlug: slug,
          filmTitle: title,
          filmDescription: description || undefined,
          duration,
          posterUrl,
          trailerUrl,
          showtimes: times,
          sourceUrl: 'https://www.cinemalatina.it/',
        });
      }

      // If no showtimes found but title exists, add with generic info
      if (Object.keys(showtimesByCinema).length === 0 && title) {
        // Check if there's a single ORARI line
        const text = $slide.text();
        const orariMatch = text.match(/ORARI:\s*([\d:,\s]+)/g);
        if (orariMatch) {
          for (const match of orariMatch) {
            const times = match.replace('ORARI:', '').trim().split(',').map(t => t.trim()).filter(Boolean);
            // Try to find which cinema this belongs to
            const cinemaMatch = match.match(/Multisala\s+(Corso|Supercinema\s*2\.0)/i);
            if (cinemaMatch) {
              const cinemaName = `Multisala ${cinemaMatch[1]}`;
              const slug = cinemaMatch[1].includes('Supercinema') ? 'supercinema' : 'multisala-corso';
              results.push({
                cinemaName,
                cinemaSlug: slug,
                filmTitle: title,
                filmDescription: description || undefined,
                duration,
                posterUrl,
                trailerUrl,
                showtimes: times,
                sourceUrl: 'https://www.cinemalatina.it/',
              });
            }
          }
        }
      }
    });

    console.log(`[CinemaScraper] cinemalatina.it: ${results.length} showtimes found`);
  } catch (err: any) {
    console.error(`[CinemaScraper] cinemalatina.it error: ${err.message?.slice(0, 100)}`);
  }

  return results;
}

async function scrapeAppuntamentoAlCinema(cinemaSlug: string, cinemaUrl: string): Promise<CinemaShowtime[]> {
  console.log(`[CinemaScraper] Fetching appuntamentoalcinema.it for ${cinemaSlug}...`);
  const results: CinemaShowtime[] = [];

  try {
    const { data: html } = await axios.get(cinemaUrl, {
      headers: HEADERS,
      timeout: 15000,
    });
    const $ = cheerio.load(html);

    const cinemaName = $('h2.title').first().text().trim() || cinemaSlug;

    $('article.node-movie').each((_, article) => {
      const $article = $(article);
      const title = $article.find('h2 a strong').text().trim();
      if (!title) return;

      const programsText = $article.find('.node-programs .programs').text().trim();
      const showtimes = programsText ? programsText.split(',').map(t => t.trim()).filter(Boolean) : [];

      const director = $article.find('.director_link').text().trim() || undefined;
      const genre = $article.find('.genre_link').text().trim() || undefined;
      const yearText = $article.find('.year_link').text().trim();
      const year = yearText ? parseInt(yearText) : undefined;
      const posterUrl = $article.find('.poster-thumb').attr('src') || undefined;
      const trailerLink = $article.find('a[href*="/trailer"]').attr('href');
      const trailerUrl = trailerLink ? `http://appuntamentoalcinema.it${trailerLink}` : undefined;
      const detailLink = $article.find('h2 a').attr('href');
      const sourceUrl = detailLink ? `http://appuntamentoalcinema.it${detailLink}` : cinemaUrl;

      if (title) {
        results.push({
          cinemaName,
          cinemaSlug,
          filmTitle: title,
          director,
          genre,
          year,
          posterUrl,
          trailerUrl,
          showtimes,
          sourceUrl,
        });
      }
    });

    console.log(`[CinemaScraper] appuntamentoalcinema.it/${cinemaSlug}: ${results.length} films found`);
  } catch (err: any) {
    console.error(`[CinemaScraper] appuntamentoalcinema.it/${cinemaSlug} error: ${err.message?.slice(0, 100)}`);
  }

  return results;
}

export async function runCinemaLatinaScraper(): Promise<CinemaShowtime[]> {
  console.log('[CinemaScraper] Starting cinema scraper for Latina...');

  const all: CinemaShowtime[] = [];

  // Source 1: cinemalatina.it (official site, covers Supercinema + Multisala Corso)
  const cinemaLatinaResults = await scrapeCinemaLatinaIt();
  all.push(...cinemaLatinaResults);

  // Source 2: appuntamentoalcinema.it (ANICA, covers all 4 cinemas)
  const cinemas = [
    { slug: 'supercinema', url: 'http://appuntamentoalcinema.it/sale-cinematografiche/supercinema-2' },
    { slug: 'multisala-corso', url: 'http://appuntamentoalcinema.it/sale-cinematografiche/corso-1' },
    { slug: 'arena-corso', url: 'http://appuntamentoalcinema.it/sale-cinematografiche/arena-corso' },
    { slug: 'oxer', url: 'http://appuntamentoalcinema.it/sale-cinematografiche/oxer' },
  ];

  for (const cinema of cinemas) {
    const results = await scrapeAppuntamentoAlCinema(cinema.slug, cinema.url);
    all.push(...results);
  }

  // Deduplicate: if we have the same film from both sources for the same cinema,
  // prefer the one with more data (cinemalatina.it has descriptions)
  const deduped = new Map<string, CinemaShowtime>();
  for (const s of all) {
    const key = `${s.cinemaSlug}:${s.filmTitle.toLowerCase()}`;
    const existing = deduped.get(key);
    if (!existing || (s.filmDescription && !existing.filmDescription)) {
      deduped.set(key, s);
    }
  }

  const final = Array.from(deduped.values());
  console.log(`[CinemaScraper] Total unique showtimes: ${final.length}`);
  return final;
}
