const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const html = await fetchUrl('https://www.teatro.it/spettacoli/latina');
// Look for event cards - check for class names, data attributes, etc.
const checks = ['spettacolo', 'show-card', 'event-card', 'card', 'teatro', 'itemprop', 'schema', 'json'];
for (const c of checks) {
  const idx = html.indexOf(c);
  if (idx >= 0) console.log(c, 'found at', idx, ':', html.slice(Math.max(0, idx - 50), idx + 80));
}
console.log('Total length:', html.length);
// Check for ld+json
console.log('Has ld+json script:', html.includes('ld+json'));
console.log('Has schema.org:', html.includes('schema.org'));
