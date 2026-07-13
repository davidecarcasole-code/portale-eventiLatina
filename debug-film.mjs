import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  console.log('=== Checking film detail pages ===\n');
  
  try {
    // Test with one film detail page
    const filmUrl = 'https://www.mymovies.it/cinema/latina/provincia/?f=117691'; // Minions & Monsters
    
    const res = await axios.get(filmUrl, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);
    
    console.log('Page title:', $('title').text());
    console.log('Page length:', res.data.length);
    
    // Look for schedule info
    const scheduleSelectors = [
      '.schedule', '.programmazione', '.orari', '.showtimes',
      '.orari-spettacolo', '.spettacoli', '.proiezioni',
      '[class*="orario"]', '[class*="spettacolo"]', '[class*="proiezione"]'
    ];
    
    for (const sel of scheduleSelectors) {
      const count = $(sel).length;
      if (count > 0) {
        console.log(`Found ${count} elements with: ${sel}`);
        $(sel).first().each((_, el) => {
          console.log(`  HTML: ${$(el).html()?.substring(0, 300)}`);
        });
      }
    }
    
    // Look for cinema names and times
    console.log('\n--- Looking for cinema names and times ---');
    $('[class*="cinema"], [class*="sala"], [class*="theater"]').each((i, el) => {
      if (i < 10) console.log(`Cinema: ${$(el).text().trim().substring(0, 100)}`);
    });
    
    $('[class*="orario"], [class*="time"], [class*="ora"]').each((i, el) => {
      if (i < 10) console.log(`Time: ${$(el).text().trim().substring(0, 100)}`);
    });
    
    // Look for tables
    $('table').each((i, table) => {
      const $table = $(table);
      const text = $table.text().substring(0, 200);
      if (text.includes('Minions') || text.includes('Toy Story') || text.includes('ore') || text.includes(':')) {
        console.log(`\nTable ${i}: ${$table.text().substring(0, 300)}`);
      }
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);