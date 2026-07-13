import axios from 'axios';

export interface FacebookPageConfig {
  pageId: string;
  accessToken: string;
  name: string;
}

export interface FacebookEvent {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  place?: { name: string; location?: { city: string; street: string; zip: string } };
  cover?: { source: string };
  is_canceled: boolean;
  ticket_uri?: string;
}

export async function scrapeFacebookPage(pageId: string, accessToken: string): Promise<FacebookEvent[]> {
  try {
    const response = await axios.get(`https://graph.facebook.com/v19.0/${pageId}/events`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,description,start_time,end_time,place,cover,is_canceled,ticket_uri',
        since: new Date().toISOString().split('T')[0],
        limit: 100,
      },
    });
    return response.data.data || [];
  } catch (err: any) {
    console.error(`[Facebook] Error scraping page ${pageId}:`, err.response?.data || err.message);
    return [];
  }
}

export async function scrapeAllFacebookPages(pages: FacebookPageConfig[]): Promise<{ events: any[]; results: any[] }> {
  const allEvents: any[] = [];
  const results: any[] = [];
  
  for (const page of pages) {
    try {
      const events = await scrapeFacebookPage(page.pageId, page.accessToken);
      
      for (const fbEvent of events) {
        if (fbEvent.is_canceled) continue;
        
        allEvents.push({
          title: fbEvent.name,
          description: fbEvent.description || '',
          date: fbEvent.start_time.split('T')[0],
          end_date: fbEvent.end_time?.split('T')[0],
          time: fbEvent.start_time.split('T')[1]?.slice(0, 5),
          location: fbEvent.place?.name,
          city: fbEvent.place?.location?.city || 'Latina',
          address: fbEvent.place?.location?.street,
          image_url: fbEvent.cover?.source,
          source_url: fbEvent.ticket_uri || `https://facebook.com/events/${fbEvent.id}`,
          source_name: page.name,
          category_id: 'enogastronomia', // default, will be reclassified
        });
      }
      results.push({ page: page.name, count: events.length });
    } catch (err: any) {
      console.error(`[Facebook] Error with page ${page.name}:`, err.message);
      results.push({ page: page.name, count: 0, error: err.message });
    }
  }
  
  return { events: allEvents, results };
}