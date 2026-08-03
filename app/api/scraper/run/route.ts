import { NextRequest } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET || "vercel-cron-secret";

export async function POST(req: NextRequest) {
  try {
    const { jsonResponse, handleApiError, requireAdmin } = await import("@/lib/api-helpers");
    const isCron = req.headers.get("x-vercel-cron") === "1" || req.headers.get("authorization") === `Bearer ${CRON_SECRET}`;
    if (!isCron) await requireAdmin(req);
    const { source } = await req.json().catch(() => ({}));

    const { runScraper, backfillKidsCategories } = await import("@/lib/scraper/engine");
    const results = await runScraper(source || undefined);
    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);

    let backfilledKids = 0;
    try {
      backfilledKids = await backfillKidsCategories();
    } catch (err: any) {
      console.error(`[Scraper] Kids backfill failed: ${err.message?.slice(0, 100)}`);
    }

    let cinemaResult: any = null;
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS cinema_showtimes (
          id SERIAL PRIMARY KEY,
          cinema_slug TEXT NOT NULL,
          film_title TEXT NOT NULL,
          film_description TEXT,
          director TEXT,
          genre TEXT,
          year INTEGER,
          duration TEXT,
          poster_url TEXT,
          trailer_url TEXT,
          showtimes JSONB NOT NULL DEFAULT '[]',
          source_url TEXT,
          scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      const { runCinemaLatinaScraper } = await import("@/lib/scraper/cinemaLatinaScraper");
      const cinemaResults = await runCinemaLatinaScraper();
      await prisma.$executeRawUnsafe(`DELETE FROM cinema_showtimes`);
      for (const r of cinemaResults) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO cinema_showtimes
            (cinema_slug, film_title, film_description, director, genre, year, duration, poster_url, trailer_url, showtimes, source_url, scraped_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
          r.cinemaSlug, r.filmTitle, r.filmDescription || null, r.director || null,
          r.genre || null, r.year || null, r.duration || null, r.posterUrl || null,
          r.trailerUrl || null, JSON.stringify(r.showtimes || []), r.sourceUrl || null
        );
      }
      cinemaResult = { scraped: cinemaResults.length };
      console.log(`[Scraper] Cinema: ${cinemaResults.length} showtimes scraped`);
    } catch (cinemaErr: any) {
      console.error(`[Scraper] Cinema scrape failed: ${cinemaErr.message?.slice(0, 100)}`);
    }

    return jsonResponse({ message: "Scraper completato", results, totalInserted, backfilledKids, cinema: cinemaResult });
  } catch (err) { const { handleApiError } = await import("@/lib/api-helpers"); return handleApiError(err); }
}
