const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode, 'for', url);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Length:', data.length);
        console.log('Body:', data.slice(0, 500));
      });
    }).on('error', reject);
  });
}

await fetchUrl('https://www.teatro.it/spettacoli/latina?format=json');
