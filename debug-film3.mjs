import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  console.log('=== Detailed HTML inspection ===\n');
  
  try {
    const res = await axios.get('https://www.mymovies.it/cinema/latina/provincia/?f=117691', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    const $ = cheerio.load(res.data);
    
    console.log('Page title:', $('title').text());
    
    // Look for all divs with classes containing schedule-related terms
    const scheduleClasses = [
      'orario', 'orari', 'programmazione', 'spettacolo', 'spettacoli',
      'orario', 'proiezione', 'proiezioni', 'cinema', 'sala', 'salle',
      'schedule', 'showtime', 'showtimes', 'programmazione', 'orari'
    ];
    
    for (const cls of scheduleClasses) {
      const elements = $(`[class*="${cls}"]`);
      if (elements.length > 0) {
        console.log(`\nFound ${elements.length} elements with class containing "${cls}":`);
        elements.slice(0, 3).each((i, el) => {
          console.log(`  [${i}] ${$(el).prop('tagName')}.${$(el).attr('class')}: ${$(el).text().trim().substring(0, 200)}`);
        });
      }
    }
    
    // Look for all elements with data attributes
    $('[data-*]').each((i, el) => {
      if (i < 20) {
        const attrs = Object.keys($(el)[0].attribs).filter(k => k.startsWith('data-'));
        if (attrs.length > 0) {
          console.log(`Data attributes: ${attrs.join(', ')} on ${$(el).prop('tagName')}`);
        }
      }
    });
    
    // Look for script tags with JSON data
    $('script[type="application/ld+json"], script[type="application/json"]').each((i, el) => {
      try {
        const content = $(el).html();
        if (content && (content.includes('Minions') || content.includes('schedule') || content.includes('event'))) {
          console.log(`\nJSON-LD script found: ${content.substring(0, 500)}`);
        }
      } catch (e) {}
    });
    
    // Look for any elements containing time patterns
    $('*').each((i, el) => {
      const text = $(el).text().trim();
      if (text.match(/^\d{1,2}:\d{2}$/) && text.length <= 5) {
        if (i < 20) console.log(`Time element: ${text} in ${$(el).prop('tagName')}.${$(el).attr('class')}`);
      }
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);