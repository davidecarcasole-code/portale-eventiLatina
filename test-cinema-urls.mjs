import axios from 'axios';
import * as cheerio from 'cheerio';

async function testUrl(url) {
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);
    console.log(`\n=== ${url} ===`);
    console.log(`Page title: ${$('title').text()}`);
    console.log(`Page length: ${res.data.length} bytes`);

    // Check for cinema schedule elements
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

    // Check for today's schedule
    const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
    if ($('body').text().includes('oggi') || $('body').text().includes('Oggi')) {
      console.log('  Page mentions "oggi"');
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function main() {
  const urls = [
    'https://www.mymovies.it/cinema/latina/',
    'https://www.mymovies.it/cinema/latina/programmazione/',
    'https://www.mymovies.it/cinema/latina/oggi/',
    'https://www.mymovies.it/cinema/latina/sale/',
    'https://www.mymovies.it/cinema/latina/programmazione/oggi/',
  ];

  for (const url of urls) {
    await testUrl(url);
  }
}

main().catch(console.error);