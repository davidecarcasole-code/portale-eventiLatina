const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const regex = /<script\s+type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
        let match;
        let itemListCount = 0;
        while ((match = regex.exec(data)) !== null) {
          try {
            const parsed = JSON.parse(match[1].trim());
            if (parsed['@type'] === 'ItemList' && Array.isArray(parsed.itemListElement)) {
              console.log('Found ItemList with', parsed.itemListElement.length, 'items');
              console.log('First item:', parsed.itemListElement[0]?.item?.name);
              itemListCount++;
            }
          } catch(e) { console.log('Parse error:', e.message.slice(0, 80)); }
        }
        console.log('Total ItemLists:', itemListCount);
      });
    }).on('error', reject);
  });
}

await fetchUrl('https://www.teatro.it/spettacoli/latina?format=json');
