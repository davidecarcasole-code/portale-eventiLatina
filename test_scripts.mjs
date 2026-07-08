const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Find all script tags
        const regex = /<script[^>]*>([\s\S]*?)<\/script>/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
          const c = match[1].trim();
          if (c.length > 0 && c.length < 5000) {
            // Check if it contains interesting data
            if (c.includes('spettacoli') || c.includes('events') || c.includes('latina') || c.includes('__NEXT') || c.includes('__NUXT') || c.includes('window.__')) {
              console.log('--- Script tag ---');
              console.log(c.slice(0, 1000));
            }
          }
        }
        // Also look for any JSON data
        const jsonBlocks = data.match(/\{["'][^"']*["'][\s\S]*?\}[,;]/g);
        if (jsonBlocks) {
          for (const j of jsonBlocks.slice(0, 5)) {
            if (j.length > 100 && j.length < 10000) {
              console.log('JSON block:', j.slice(0, 500));
            }
          }
        }
      });
    }).on('error', reject);
  });
}

await fetchUrl('https://www.teatro.it/spettacoli/latina');
