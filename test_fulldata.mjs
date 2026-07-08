const https = await import('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Check for JSON-LD TheaterEvent
        const hasItemList = data.includes('ItemList');
        const hasTheaterEvent = data.includes('TheaterEvent');
        const hasGiobbe = data.includes('Giobbe');
        const hasLdJson = data.includes('ld+json');
        const hasItemListTheater = data.includes('\"itemListElement\"');
        const hasJsonLdTheater = data.includes('TheaterEvent');
        
        console.log('ItemList:', hasItemList);
        console.log('TheaterEvent:', hasTheaterEvent);
        console.log('Giobbe:', hasGiobbe);
        console.log('ld+json:', hasLdJson);
        console.log('itemListElement:', hasItemListTheater);
        
        // Count TheaterEvent occurrences
        let count = 0, pos = 0;
        while ((pos = data.indexOf('TheaterEvent', pos + 1)) !== -1) count++;
        console.log('TheaterEvent count:', count);
        
        // Print ld+json content
        const regex = /<script\s+type=\\"application\/ld\+json\\">([\s\S]*?)<\/script>/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
          try {
            const parsed = JSON.parse(match[1].trim());
            if (parsed['@type'] === 'ItemList') {
              console.log('ItemList items:', parsed.itemListElement?.length);
              console.log('First:', JSON.stringify(parsed.itemListElement?.[0]?.item?.name));
            }
          } catch(e) { /* skip */ }
        }
      });
    }).on('error', reject);
  });
}

await fetchUrl('https://www.teatro.it/spettacoli/latina?format=json');
