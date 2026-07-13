import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  console.log('=== Deep dive into MYmovies structure ===\n');
  
  try {
    const res = await axios.get('https://www.mymovies.it/cinema/latina/programmazione/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);
    
    const filmLinks = $('a[href*="/cinema/latina/provincia/?f="]');
    console.log(`Found ${filmLinks.length} film links`);
    
    filmLinks.first().each((_, el) => {
      const $link = $(el);
      const title = $link.text().trim();
      const href = $link.attr('href');
      console.log(`\nFilm: ${title}`);
      console.log(`Link: ${href}`);
      
      const $parent = $link.closest('div, article, li, tr, td, .card, .item, .film, .scheda, .scheda-film, .film-card, .movie-card');
      console.log(`Parent tag: ${$parent.prop('tagName')}`);
      console.log(`Parent class: ${$parent.attr('class')}`);
      console.log(`Parent HTML (first 500 chars): ${$parent.html()?.substring(0, 500)}`);
      
      const $nearby = $link.closest('div, article, li, tr').find('[class*="orario"], [class*="time"], [class*="ora"], [class*="orario"], [class*="data"], [class*="date"]');
      console.log(`Time elements found: ${$nearby.length}`);
      $nearby.each((_, el) => console.log(`  Time elem: ${$(el).text().trim()}`));
    });
    
    $('tr').each((i, el) => {
      const $row = $(el);
      const text = $row.text().trim();
      if (text.includes('Minions') || text.includes('Toy Story') || text.includes('La casa')) {
        console.log(`\nTable row: ${text.substring(0, 200)}`);
        $row.find('td, th').each((_, cell) => {
          console.log(`  Cell: ${$(cell).text().trim().substring(0, 100)}`);
        });
      }
    });
  
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);