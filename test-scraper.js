import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  try {
    const res = await axios.get('https://www.mymovies.it/cinema/latina', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);

    console.log('[MYmovies] Page title:', $('title').text());
    console.log('[MYmovies] Page length:', res.data.length);
    
    // Look for film elements
    const selectors = [
      '.film-card', '.movie-card', '.scheda-film', '.film-item', '.movie-item',
      '.movie', '.film', '.scheda', '.card-film', '[class*="film"]', '[class*="movie"]',
      '.grid-item', '.list-item', 'article', '.event-item', '.evento',
      '.programma-film', '.film-in-programmazione', '.film-in-sala',
      '.film-title', '.movie-title', '.title', 'h3', 'h2', 'h3'
    ];

    for (const selector of selectors) {
      const cards = $(selector);
      if (cards.length > 0) {
        console.log(`Found ${cards.length} elements with selector: ${selector}`);
        
        cards.each((_, el) => {
          const $card = $(el);
          const title = $card.find('h1, h2, h3, h4, .title, .film-title, .movie-title, .titolo, .name, h3 a, h2 a, a').first().text().trim();
          if (title && title.length >= 3) {
            const cardText = $card.text();
            console.log(`Found: "${title.substring(0, 80)}" | Text: ${cardText.substring(0, 200)}`);
          }
        });
      }
    }

    // Try looking for film links
    console.log('\n--- Checking film links ---');
    $('a[href*="/film/"], a[href*="/scheda/"]').each((_, el) => {
      const $link = $(el);
      const title = $link.text().trim() || $link.attr('title');
      const href = $link.attr('href');
      if (title && title.length > 3) {
        console.log(`Film link: "${title.substring(0, 80)}" -> ${href}`);
      }
    });
    
    // Check raw HTML for film-related content
    const html = $('html').html();
    const filmMatches = html.match(/film|scheda|proiezione|spettacolo/gi);
    console.log('\nFilm-related words in HTML:', filmMatches ? filmMatches.length : 0);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);