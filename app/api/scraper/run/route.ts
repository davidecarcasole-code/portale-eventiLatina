import { NextRequest } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET || "vercel-cron-secret";

function fireAndForget(url: string, payload: any) {
  const p = fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${CRON_SECRET}`,
    },
    body: JSON.stringify(payload),
  });
  p.catch((e: any) => console.error(`[Scraper] Chain fire failed: ${e?.message}`));
}

async function runCinemaBlock() {
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
    console.log(`[Scraper] Cinema: ${cinemaResults.length} showtimes scraped`);
    return { scraped: cinemaResults.length };
  } catch (cinemaErr: any) {
    console.error(`[Scraper] Cinema scrape failed: ${cinemaErr.message?.slice(0, 100)}`);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { jsonResponse, handleApiError, requireAdmin } = await import("@/lib/api-helpers");
    const isCron = req.headers.get("x-vercel-cron") === "1" || req.headers.get("authorization") === `Bearer ${CRON_SECRET}`;
    if (!isCron) await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const sourceType = body.source || undefined;
    const batchIndex = Number(body.batchIndex) || 0;
    let totalBatches = Number(body.totalBatches) || 0;

    const { runScraperBatch, getScraperBatches, backfillKidsCategories } = await import("@/lib/scraper/engine");

    const isCoordinator = totalBatches === 0;
    if (isCoordinator) {
      const plan = await getScraperBatches(sourceType);
      totalBatches = plan.totalBatches;
      if (totalBatches > 1) {
        const origin = new URL(req.url).origin;
        console.log(`[Scraper] Coordinator firing batches 1..${totalBatches - 1} in parallel`);
        for (let i = 1; i < totalBatches; i++) {
          fireAndForget(origin + "/api/scraper/run", {
            batchIndex: i,
            totalBatches,
            source: body.source || undefined,
          });
        }
      }
    }

    let results: any[] = [];
    try {
      results = await runScraperBatch(sourceType, batchIndex);
    } catch (batchErr: any) {
      console.error(`[Scraper] Batch ${batchIndex} failed: ${batchErr.message?.slice(0, 300)}`);
    }
    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);

    if (isCoordinator && totalBatches > 1) {
      await new Promise((r) => setTimeout(r, 10000));
    }

    const isFinal = batchIndex >= totalBatches - 1;
    let backfilledKids = 0;
    let cinemaResult: any = null;
    if (isFinal) {
      try {
        backfilledKids = await backfillKidsCategories();
      } catch (err: any) {
        console.error(`[Scraper] Kids backfill failed: ${err.message?.slice(0, 100)}`);
      }
      cinemaResult = await runCinemaBlock();
    }

    return jsonResponse({
      message: isFinal ? "Scraper completato" : `Scraper in corso (batch ${batchIndex + 1}/${totalBatches})`,
      results,
      totalInserted,
      backfilledKids,
      cinema: cinemaResult,
      batched: totalBatches > 1,
      batchIndex,
      totalBatches,
    });
  } catch (err) { const { handleApiError } = await import("@/lib/api-helpers"); return handleApiError(err); }
}
