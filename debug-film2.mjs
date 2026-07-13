import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  console.log('=== Extracting full schedule from film detail pages ===\n');
  
  const filmUrls = [
    'https://www.mymovies.it/cinema/latina/provincia/?f=117691', // Minions & Monsters
    'https://www.mymovies.it/cinema/latina/provincia/?f=119552', // La casa - Il rogo del male
    'https://www.mymovies.it/cinema/latina/provincia/?f=114743', // Toy Story 5
  ];

  for (const url of filmUrls) {
    console.log(`\n=== Checking: ${url} ===`);
    
    try {
      const res = await axios.get(url, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      const $ = cheerio.load(res.data);
      
      console.log('Page title:', $('title').text());
      
      // Try to find the schedule table
      const tables = $('table');
      console.log(`Found ${tables.length} tables`);
      
      tables.each((i, table) => {
        const $table = $(table);
        const text = $table.text().substring(0, 500);
        if (text.includes(':') || text.includes('Minions') || text.includes('Toy Story')) {
          console.log(`\nTable ${i}:`);
          console.log($table.html()?.substring(0, 2000));
        }
      });
      
      // Look for cinema names in specific elements
      $('[class*="cinema"], [class*="sala"], [class*="theater"]').each((i, el) => {
        if (i < 5) console.log(`Cinema: ${$(el).text().trim()}`);
      });
      
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
}

main().catch(console.error);