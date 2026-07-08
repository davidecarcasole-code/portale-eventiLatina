const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve([res.statusCode, data]));
    }).on('error', reject);
  });
}

const [status, html] = await fetchUrl('https://www.teatro.it/spettacoli/latina?format=json');
console.log('Status:', status, 'Length:', html.length);

// Try flexible JSON-LD extraction
const regex = /<script[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let itemListCount = 0;
while ((match = regex.exec(html)) !== null) {
  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed['@type'] === 'ItemList' && Array.isArray(parsed.itemListElement)) {
      itemListCount++;
      console.log('ItemList items:', parsed.itemListElement.length);
      for (const item of parsed.itemListElement.slice(0, 3)) {
        if (item.item?.['@type'] === 'TheaterEvent') {
          console.log('  -', item.item.name, '|', item.item.startDate, '|', item.item.location?.address?.addressLocality);
        }
      }
    }
  } catch(e) { console.log('Parse err:', e.message.slice(0, 60)); }
}
console.log('Total ItemLists found:', itemListCount);
