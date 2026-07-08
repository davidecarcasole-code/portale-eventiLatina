const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html'
      } 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Length:', data.length);
        console.log('Has ld+json:', data.includes('ld+json'));
        console.log('Has TheaterEvent:', data.includes('TheaterEvent'));
        console.log('Has ItemList:', data.includes('ItemList'));
        console.log('Has Giobbe:', data.includes('Giobbe'));
        // If no content, print first 500 chars
        if (!data.includes('TheaterEvent')) console.log('Preview:', data.slice(0, 500));
      });
    }).on('error', reject);
  });
}

await fetchUrl('https://www.teatro.it/spettacoli/latina');
