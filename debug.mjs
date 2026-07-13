import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  console.log('=== Testing MYmovies scraper ===\n');
  
  try {
    const res = await axios.get('https://www.mymovies.it/cinema/latina/programmazione/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);
    
    console.log('Page title:', $('title').text());
    console.log('Page length:', res.data.length);
    
    // Check film links
    const filmLinks = $('a[href*="/cinema/latina/provincia/?f="]');
    console.log(`Found ${filmLinks.length} film links`);
    
    filmLinks.each((_, el) => {
      const $link = $(el);
      const title = $link.text().trim();
      const href = $link.attr('href');
      if (title && title.length > 2 && !title.includes('Accedi') && !title.includes('Esci') && !title.includes('Cinema') && !title.includes('Provincia')) {
        console.log(`  Film: "${title}" -> ${href}`);
      }
    });
    
    // Check for today's schedule
    const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
    console.log('\nToday is:', today);
    if ($('body').text().toLowerCase().includes('oggi')) {
      console.log('Page mentions "oggi"');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);