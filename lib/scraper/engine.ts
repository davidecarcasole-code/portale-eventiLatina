import { ScrapedEvent } from './scraped-event';
import { runCentroItaliaScraper } from './centroItaliaScraper';
import { runLazioNascostoScraper } from './lazionascostoScraper';
import { runLatinaTodayScraper } from './latinatodayScraper';
import { runComuneLatinaScraper } from './comuneLatinaScraper';
import { runItinerariScraper } from './itinerariScraper';
import { runFattivivoScraper } from './fattivivoScraper';
import { scrapeTeatroIt } from './teatroItScraper';
import { runLazioEventiScraper } from './lazioeventiScraper';
import { runEventbriteScraper } from './eventbriteScraper';
import { runComingSoonCinemaScraper } from './comingSoonCinemaScraper';
import { runVisitLazioScraper } from './visitlazioScraper';
import { runCheventiScraper } from './cheventiScraper';
import { runLazioinfestaScraper } from './lazioinfestaScraper';
import { runCulturalazioScraper } from './culturalazioScraper';
import { runLatinaonlineScraper } from './latinaonlineScraper';
import { runLatinaquotidianoScraper } from './latinaquotidianoScraper';
import { runEventiYogaScraper } from './eventiyogaScraper';
import { runLaFilibustaScraper } from './lafilibustapontinaScraper';
import { runParksScraper } from './parksScraper';
import { runOrangogoScraper } from './orangogoScraper';
import { runOpesLatinaScraper } from './opeslatinaScraper';
import { runAtleticaLatinaScraper } from './atleticalatinaScraper';
import { runTuttoCampiScraper } from './tuttocampiestiviScraper';
import { runAgesciScraper } from './agesciScraper';
import { runTrekkingRomaScraper } from './trekkingromaScraper';
import { runEscursionismoScraper } from './escursionismoScraper';
import { runLatiumVetusScraper } from './latiumvetusScraper';
import { runMondorealeScraper } from './mondorealeScraper';
import { runEventiesagreScraper } from './eventiesagreScraper';
import { runTicketoneScraper } from './ticketoneScraper';
import { runItinerarinelgustoScraper } from './itinerarinelgustoScraper';
import { runRivieraDiUlisseScraper } from './rivieradiulisseScraper';
import { runSagritalyScraper } from './sagritalyScraper';
import { runLuogoArteScraper } from './luogoarteScraper';
import { getProvinceFromCity } from './city-to-province';

const OLD_TO_NEW_CATEGORY: Record<string, string> = {
  cat_music: 'musica',
  cat_theater: 'teatro',
  cat_culture: 'cultura',
  cat_sports: 'sport',
  cat_nature: 'natura',
  cat_trekking: 'trekking',
  cat_mountain: 'montagna',
  cat_excursion: 'escursioni',
  cat_daytrip: 'gite',
  cat_entertainment: 'spettacolo',
  cat_food: 'enogastronomia',
  cat_kids: 'bambini',
  cat_borghi: 'borghi',
  cat_benessere: 'benessere',
  cat_salute: 'salute',
  cat_rosa: 'rosa',
  cat_exhibition: 'mostre',
  cat_cinema: 'cinema',
  cat_sea: 'mare',
  cat_comingsoon_cinema: 'cinema',
  cat_comingsoon_sea: 'mare',
  // Direct slugs from scrapers
  cinema: 'cinema',
  mare: 'mare',
  escursioni: 'escursioni',
};

const SCRAPER_REGISTRY: Record<string, { name: string; url: string; fn: () => Promise<ScrapedEvent[]> }> = {
  centroitalia: { name: 'CentroItaliaEvents', url: 'https://www.centroitaliaevents.it/', fn: runCentroItaliaScraper },
  lazionascosto: { name: 'LazioNascosto', url: 'https://www.lazionascosto.it/', fn: runLazioNascostoScraper },
  latinatoday: { name: 'LatinaToday', url: 'https://www.latinatoday.it/', fn: runLatinaTodayScraper },
  comunelatina: { name: 'Comune di Latina', url: 'https://www.comune.latina.it/', fn: runComuneLatinaScraper },
  itinerari: { name: "Itinerari nell'Arte", url: 'https://www.itinerarinellarte.it/', fn: runItinerariScraper },
  fattivivo: { name: 'FattiVivo', url: 'https://www.fattivivo.com/', fn: runFattivivoScraper },
  teatroIt: { name: 'Teatro.it', url: 'https://www.teatro.it/spettacoli/latina', fn: scrapeTeatroIt },
  lazioeventi: { name: 'LazioEventi.com', url: 'https://lazioeventi.com/oggi-nel-lazio', fn: runLazioEventiScraper },
  eventbrite: { name: 'Eventbrite', url: 'https://www.eventbrite.it/d/italy--latina/health--events', fn: runEventbriteScraper },
  comingsoonscinema: { name: 'ComingSoon Cinema Latina', url: 'https://www.comingsoon.it/cinema/latina', fn: runComingSoonCinemaScraper },
  visitlazio: { name: 'VisitLazio', url: 'https://www.visitlazio.com/eventi/', fn: runVisitLazioScraper },
  cheventi: { name: 'Cheventi', url: 'https://www.cheventi.it/regioni/lazio/latina/', fn: runCheventiScraper },
  lazioinfesta: { name: 'LazioInfesta', url: 'https://www.lazioinfesta.com/eventi/provincia/lt/latina.html', fn: runLazioinfestaScraper },
  culturalazio: { name: 'CulturaLazio', url: 'https://www.culturalazio.com/agenda/', fn: runCulturalazioScraper },
  latinaonline: { name: 'LatinaOnline', url: 'https://www.latinaonline.it/cosa-fare-a-latina/', fn: runLatinaonlineScraper },
  latinaquotidiano: { name: 'LatinaQuotidiano', url: 'https://www.latinaquotidiano.it/', fn: runLatinaquotidianoScraper },
  eventiyoga: { name: 'EventiYoga.it', url: 'https://eventiyoga.it/eventi-yoga/', fn: runEventiYogaScraper },
  lafilibusta: { name: 'La FiliBusta Pontina', url: 'https://lafilibustapontina.it/events/', fn: runLaFilibustaScraper },
  parks: { name: 'Parks.it - Parco del Circeo', url: 'https://www.parks.it/parco.nazionale.circeo/', fn: runParksScraper },
  orangogo: { name: 'OrangoGo', url: 'https://www.orangogo.it/', fn: runOrangogoScraper },
  opeslatina: { name: 'Opes Latina', url: 'https://www.opeslatina.it/', fn: runOpesLatinaScraper },
  atleticalatina: { name: 'Atletica Latina', url: 'https://www.atleticalatina.it/', fn: runAtleticaLatinaScraper },
  tuttocampiestivi: { name: 'TuttoCampiEstivi', url: 'https://www.tuttocampiestivi.com/', fn: runTuttoCampiScraper },
  agesci: { name: 'Agesci Lazio', url: 'https://www.agescilt3.it/calendario/', fn: runAgesciScraper },
  trekkingroma: { name: 'TrekkingRoma', url: 'https://trekkingroma.it/eventi/', fn: runTrekkingRomaScraper },
  escursionismo: { name: 'Escursionismo.it', url: 'https://www.escursionismo.it/escursioni/', fn: runEscursionismoScraper },
  latiumvetus: { name: 'Latium Vetus', url: 'https://www.latiumvetus.it/visite/', fn: runLatiumVetusScraper },
  mondoreale: { name: 'MondoReale.it', url: 'https://www.mondoreale.it/', fn: runMondorealeScraper },
  eventiesagre: { name: 'EventieSagre', url: 'https://www.eventiesagre.it/Regione/Lazio/Provincia-di-Latina/', fn: runEventiesagreScraper },
  ticketone: { name: 'TicketOne', url: 'https://www.ticketone.it/cityd/latina-1347/', fn: runTicketoneScraper },
  itinerarinelgusto: { name: 'Itinerari nel Gusto', url: 'https://www.itinerarinelgusto.it/sagre-e-feste/latina/', fn: runItinerarinelgustoScraper },
  rivieradiulisse: { name: 'Parco Riviera di Ulisse', url: 'https://www.parchilazio.it/parcorivieradiulisse-ricerca_news', fn: runRivieraDiUlisseScraper },
  sagritaly: { name: 'Sagritaly', url: 'https://sagritaly.com/province-sagre/latina/', fn: runSagritalyScraper },
  luogoarte: { name: 'LuogoArte - Immersioni Sonore', url: 'https://www.luogoarte.it/immersioni-sonore.html', fn: runLuogoArteScraper },
};

async function getPrisma() {
  const mod = await import("@/lib/prisma");
  return mod.prisma;
}

async function buildCategoryMap(): Promise<Map<string, number>> {
  const prisma = await getPrisma();
  const cats = await prisma.category.findMany({ select: { id: true, slug: true } });
  const map = new Map<string, number>();
  for (const c of cats) map.set(c.slug, c.id);
  return map;
}

function resolveCategoryId(categoryId: string, catMap: Map<string, number>): number | null {
  const slug = OLD_TO_NEW_CATEGORY[categoryId] || categoryId;
  return catMap.get(slug) ?? null;
}

function parseDateStr(dateStr: string): Date | null {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
  return null;
}

function dedupKey(e: ScrapedEvent): string {
  return e.title.toLowerCase().slice(0, 80) + e.date + e.city;
}

export interface ScraperResult {
  source: string;
  found: number;
  inserted: number;
}

export async function ensureScrapedSourcesTable() {
  const prisma = await getPrisma();
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS scraped_sources (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'html',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        selectors TEXT,
        city TEXT,
        province TEXT,
        category_id INTEGER,
        last_scraped_at TIMESTAMP WITH TIME ZONE,
        config_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE scraped_sources ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`);
    console.log('[Scraper] Ensured scraped_sources table exists with all columns');
  } catch (err) {
    console.error('[Scraper] Failed to ensure scraped_sources table:', err);
  }
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0`);
  } catch {}
}

export async function ensureDefaultSources() {
  await ensureScrapedSourcesTable();
  const prisma = await getPrisma();
  for (const [type, info] of Object.entries(SCRAPER_REGISTRY)) {
    const existing = await prisma.scrapedSource.findFirst({ where: { type } });
    if (!existing) {
      await prisma.scrapedSource.create({
        data: { name: info.name, url: info.url, type, isActive: true },
      });
      console.log(`[Scraper] Created default source: ${info.name} (${type})`);
    }
  }
}

async function loadExistingEvents(): Promise<{ bySourceUrl: Set<string>; byDedup: Set<string> }> {
  const prisma = await getPrisma();
  const existing = await prisma.event.findMany({
    where: { isAutoGenerated: true },
    select: { title: true, date: true, city: true, sourceUrl: true },
  });
  const bySourceUrl = new Set<string>();
  const byDedup = new Set<string>();
  for (const e of existing) {
    if (e.sourceUrl) bySourceUrl.add(e.sourceUrl);
    if (e.title && e.date) {
      const d = e.date instanceof Date ? e.date.toISOString().split('T')[0] : '';
      byDedup.add(e.title.toLowerCase().slice(0, 80) + d + (e.city || ''));
    }
  }
  return { bySourceUrl, byDedup };
}

async function runSingleSource(
  name: string,
  scraperFn: () => Promise<ScrapedEvent[]>,
  existingEvents: { bySourceUrl: Set<string>; byDedup: Set<string> },
  catMap: Map<string, number>,
): Promise<ScraperResult> {
  console.log(`[Scraper] Source: ${name}...`);
  try {
    const events = await scraperFn();
    console.log(`[Scraper] ${name}: ${events.length} unique events scraped`);

    let inserted = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    for (const e of events) {
      const eventDate = parseDateStr(e.date);
      if (!eventDate || eventDate < today) continue;
      if (e.source_url && existingEvents.bySourceUrl.has(e.source_url)) continue;
      const key = dedupKey(e);
      if (existingEvents.byDedup.has(key)) continue;

      const prisma = await getPrisma();
      try {
        await prisma.event.create({
          data: {
            title: e.title.slice(0, 200),
            description: e.description?.slice(0, 2000) || null,
            categoryId: resolveCategoryId(e.category_id, catMap),
            date: parseDateStr(e.date),
            endDate: e.end_date ? parseDateStr(e.end_date) : null,
            time: e.time || null,
            timePeriod: e.time_period || null,
            location: e.location || null,
            city: e.city || 'Latina',
            province: getProvinceFromCity(e.city || 'Latina'),
            region: 'Lazio',
            imageUrl: e.image_url || null,
            sourceUrl: e.source_url || null,
            sourceName: e.source_name || null,
            isAutoGenerated: true,
            isPublished: true,
          },
        });
        inserted++;
        existingEvents.bySourceUrl.add(e.source_url || '');
        existingEvents.byDedup.add(key);
      } catch (err: any) {
        console.error(`[Scraper] Insert error: ${err.message?.slice(0, 100)} for "${e.title.slice(0, 40)}"`);
      }
    }

    console.log(`[Scraper] ${name}: ${inserted} new events inserted`);
    return { source: name, found: events.length, inserted };
  } catch (err: any) {
    console.error(`[Scraper] ${name} error: ${err.message?.slice(0, 100)}`);
    return { source: name, found: 0, inserted: 0 };
  }
}

export async function runScraper(sourceType?: string): Promise<ScraperResult[]> {
  console.log('[Scraper] Starting...');
  const prisma = await getPrisma();

  const [catMap, existingEvents] = await Promise.all([
    buildCategoryMap(),
    loadExistingEvents(),
  ]);

  const results: ScraperResult[] = [];

  const where: any = { isActive: true };
  if (sourceType) where.type = sourceType;
  const sources = await prisma.scrapedSource.findMany({ where });

  for (const src of sources) {
    const registryEntry = SCRAPER_REGISTRY[src.type];
    if (!registryEntry) {
      console.log(`[Scraper] Unknown type "${src.type}" for source "${src.name}" — skipping`);
      continue;
    }
    const result = await runSingleSource(src.name, registryEntry.fn, existingEvents, catMap);
    results.push(result);
    try {
      await prisma.scrapedSource.update({ where: { id: src.id }, data: { lastScrapedAt: new Date() } });
    } catch (e: any) {
      console.error(`[Scraper] Failed to update lastScrapedAt for ${src.name}: ${e.message?.slice(0, 100)}`);
    }
  }

  // Fallback: if sourceType specified but no DB sources were found, try registry directly
  if (sourceType && sources.length === 0) {
    const entry = SCRAPER_REGISTRY[sourceType];
    if (entry) {
      console.log(`[Scraper] Running ${entry.name} directly from registry (no DB source record found)`);
      const result = await runSingleSource(entry.name, entry.fn, existingEvents, catMap);
      results.push(result);
    } else {
      console.log(`[Scraper] Unknown source type "${sourceType}" — not in registry either`);
    }
  }

  // Fallback: if running all sources and none from DB, run all from registry
  if (!sourceType && sources.length === 0) {
    console.log('[Scraper] No DB sources found, running all from registry directly');
    for (const [type, entry] of Object.entries(SCRAPER_REGISTRY)) {
      const result = await runSingleSource(entry.name, entry.fn, existingEvents, catMap);
      results.push(result);
    }
  }

  console.log(`[Scraper] Done. Results: ${JSON.stringify(results)}`);
  return results;
}

export async function previewScraper(): Promise<ScrapedEvent[]> {
  console.log('[Scraper] Preview mode - scraping without saving...');

  const all: ScrapedEvent[] = [];
  const seen = new Set<string>();

  async function collect(name: string, scraperFn: () => Promise<ScrapedEvent[]>): Promise<void> {
    try {
      const events = await scraperFn();
      for (const e of events) {
        const key = dedupKey(e);
        if (!seen.has(key)) {
          seen.add(key);
          all.push(e);
        }
      }
      console.log(`[Scraper] ${name}: ${events.length} events`);
    } catch (err: any) {
      console.error(`[Scraper] ${name} error: ${err.message?.slice(0, 100)}`);
    }
  }

  await collect('CentroItaliaEvents', runCentroItaliaScraper);
  await collect('LazioNascosto', runLazioNascostoScraper);
  await collect('LatinaToday', runLatinaTodayScraper);
  await collect('Comune di Latina', runComuneLatinaScraper);
  await collect('Itinerari nell\'Arte', runItinerariScraper);
  await collect('FattiVivo', runFattivivoScraper);
  await collect('Teatro.it', scrapeTeatroIt);
  await collect('LazioEventi.com', runLazioEventiScraper);
  await collect('Eventbrite', runEventbriteScraper);
  await collect('VisitLazio', runVisitLazioScraper);
  await collect('Cheventi', runCheventiScraper);
  await collect('LazioInfesta', runLazioinfestaScraper);
  await collect('CulturaLazio', runCulturalazioScraper);
  await collect('LatinaOnline', runLatinaonlineScraper);
  await collect('LatinaQuotidiano', runLatinaquotidianoScraper);
  await collect('EventiYoga.it', runEventiYogaScraper);
  await collect('La FiliBusta Pontina', runLaFilibustaScraper);
  await collect('Parks.it - Parco del Circeo', runParksScraper);
  await collect('OrangoGo', runOrangogoScraper);
  await collect('Opes Latina', runOpesLatinaScraper);
  await collect('Atletica Latina', runAtleticaLatinaScraper);
  await collect('TuttoCampiEstivi', runTuttoCampiScraper);
  await collect('Agesci Lazio', runAgesciScraper);
  await collect('TrekkingRoma', runTrekkingRomaScraper);
  await collect('Escursionismo.it', runEscursionismoScraper);
  await collect('Latium Vetus', runLatiumVetusScraper);
  await collect('MondoReale.it', runMondorealeScraper);
  await collect('TicketOne', runTicketoneScraper);
  await collect('Itinerari nel Gusto', runItinerarinelgustoScraper);
  await collect('Parco Riviera di Ulisse', runRivieraDiUlisseScraper);
  await collect('Sagritaly', runSagritalyScraper);

  console.log(`[Scraper] Preview: ${all.length} unique events total`);
  return all;
}
