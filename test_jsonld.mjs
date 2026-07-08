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
const regex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let match;
while ((match = regex.exec(html)) !== null) {
  const content = match[1].trim();
  if (content.includes('@type') || content.includes('@context')) {
    console.log('Found:', content.slice(0, 300));
    console.log('---');
  }
}
