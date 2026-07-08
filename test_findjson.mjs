const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Find ld+json with any attribute quoting
        const idx = data.indexOf('ld+json');
        if (idx >= 0) {
          console.log('ld+json found in page');
        } else {
          // Maybe it's escaped
          const escaped = data.indexOf('ld\\\\+json');
          if (escaped >= 0) console.log('Escaped ld+json found');
          
          // Maybe single quotes
          const sq = data.indexOf(\"ld+json\");
          if (sq >= 0) console.log('ld+json with single quotes');
          
          // Search for ItemList
          const il = data.indexOf('ItemList');
          if (il >= 0) {
            console.log('ItemList found');
            console.log('Context:', data.slice(il - 200, il + 300));
          }
        }
      });
    }).on('error', reject);
  });
}

await fetchUrl('https://www.teatro.it/spettacoli/latina?format=json');
