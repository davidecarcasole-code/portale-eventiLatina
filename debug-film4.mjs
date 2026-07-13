import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  console.log('=== Full schedule extraction ===\n');
  
  try {
    const res = await axios.get('https://www.mymovies.it/cinema/latina/provincia/?f=117691', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);
    
    console.log('Page title:', $('title').text());
    
    // Find all orari-dettaglio elements and their parent containers
    $('.orari-dettaglio').each((i, el) => {
      const $el = $(el);
      const time = $el.text().trim();
      
      // Find the parent container that has both cinema name and times
      const $container = $el.closest('[class*="cinema"], [class*="sala"], [class*="theater"], .mm-col, .mm-row, .mm-container, div').filter((i, el) => {
        const text = $(el).text();
        return text.includes('Cinema') || text.includes('Multisala') || text.includes('The Space') || text.includes('UCI') || text.includes('Cinema');
      });
      
      if ($container.length > 0) {
        const cinemaName = $container.find('[class*="cinema"], [class*="sala"], h1, h2, h3, h4, .title, .name').first().text().trim() 
          || $container.text().trim().substring(0, 100);
        console.log(`Cinema: "${cinemaName}" | Time: ${$(el).text().trim()}`);
      } else {
        // Try going up multiple levels
        let $parent = $(el).parent();
        let found = false;
        for (let level = 0; level < 5 && !found; level++) {
          const text = $parent.text().trim();
          if (text.includes('Cinema') || text.includes('Multisala') || text.includes('The Space') || text.includes('UCI') || text.includes('Cinema')) {
            const cinemaName = $parent.find('[class*="cinema"], [class*="sala"], h1, h2, h3, h4, .title, .name').first().text().trim() 
              || text.substring(0, 100);
            console.log(`Cinema: "${cinemaName}" | Time: ${$(el).text().trim()}`);
            found = true;
          }
          $parent = $parent.parent();
        }
        if (!found) {
          console.log(`Time: ${$(el).text().trim()} (no cinema found)`);
        }
      }
    });
    
    // Also try finding the schedule container
    console.log('\n--- Looking for schedule container ---');
    const containers = $('.mm-col, .mm-row, .mm-container, .mm-schedule, .schedule, .programmazione, .orari, .spettacoli');
    console.log(`Found ${containers.length} potential containers`);
    containers.each((i, el) => {
      const text = $(el).text().trim().substring(0, 200);
      if (text.includes('Minions') || text.includes('21:30') || text.includes('16:30')) {
        console.log(`Container ${i}: ${text.substring(0, 300)}`);
      }
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);