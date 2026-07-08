const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Length:', data.length);
        console.log('First 300 chars:', data.slice(0, 300));
      });
    }).on('error', reject);
  });
}

await fetchUrl('https://www.teatro.it/feed');
