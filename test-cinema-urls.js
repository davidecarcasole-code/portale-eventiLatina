import axios from 'axios';
import * as cheerio from 'cheerio';

async function testURLs() {
  const urls = [
    'https://www.mymovies.it/cinema/latina/',
    'https://www.mymovies.it/cinema/latina/programmazione/',
    'https://www.mymovies.it/cinema/latina/oggi/',
    'https://www.mymovies.it/cinema/latina/sale/',
  ];

  for (const url of urls) {
    console.log(`\n=== Testing: ${url} ===`);
    try {
      const res = await axios.get(url, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      const $ = cheerio.load(res.data);
      console.log(`Page title: ${$('title').text()}`);
      console.log(`Page length: ${res.data.length} bytes`);

      // Look for cinema schedule elements
      const todaySelectors = [
        '.schedule', '.programmazione', '.orari', '.showtimes',
        '.film-oggi', '.oggi', '.proiezioni-oggi',
        '.cinema-schedule', '.schedule-today'
      ];

      for (const sel of todaySelectors) {
        const count = $(sel).length;
        if (count > 0) {
          console.log(`  Found ${count} elements with: ${sel}`);
        }
      }

      // Check for cinema names
      $('a[href*="/cinema/"]').each((_, el) => {
        const $link = $(el);
        const text = $link.text().trim();
        const href = $link.attr('href');
        if (text && text.length > 2) {
          console.log(`  Cinema: "${text}" -> ${href}`);
        }
      });

      // Check for film titles in schedule
      $('.film, .movie, .title, .film-title, .movie-title').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 2 && text.length < 100) {
          console.log(`  Film title: ${text}`);
        }
      });

    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }
}

main().catch(console.error);