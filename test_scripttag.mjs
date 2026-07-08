const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Find ld+json script tags
        const idx = data.indexOf('ld+json');
        if (idx >= 0) {
          console.log('Found ld+json at', idx);
          console.log('Context:', data.slice(Math.max(0, idx - 50), idx + 200));
        }
        // Also look for the raw type attribute
        const idx2 = data.indexOf('application/ld+json');
        if (idx2 >= 0) {
          console.log('Found application/ld+json at', idx2);
          console.log('Context:', data.slice(Math.max(0, idx2 - 100), idx2 + 200));
        }
        // Show all script tags near that area
        const scriptIdx = data.indexOf('<script', Math.max(0, idx - 500));
        if (scriptIdx >= 0) {
          console.log('Script tag context:');
          console.log(data.slice(scriptIdx, scriptIdx + 1000));
        }
      });
    }).on('error', reject);
  });
}

await fetchUrl('https://www.teatro.it/spettacoli/latina?format=json');
