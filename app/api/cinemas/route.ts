import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { CINEMAS_LATINA } from "@/lib/cinema/cinemas";

const CREATE_TABLE = `
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
)`;

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$executeRawUnsafe(CREATE_TABLE);

    let rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM cinema_showtimes ORDER BY cinema_slug, film_title`
    );

    // Auto-scrape if table is empty or data is older than 24h
    const shouldScrape = rows.length === 0 || (rows.length > 0 && (() => {
      const latest = rows.reduce((max: Date, r: any) => {
        const d = new Date(r.scraped_at);
        return d > max ? d : max;
      }, new Date(0));
      return Date.now() - latest.getTime() > 24 * 60 * 60 * 1000;
    })());

    if (shouldScrape) {
      console.log(`[Cinemas] ${rows.length === 0 ? 'No showtimes found' : 'Data older than 24h'}, auto-scraping...`);
      try {
        const { runCinemaLatinaScraper } = await import('@/lib/scraper/cinemaLatinaScraper');
        const results = await runCinemaLatinaScraper();
        await prisma.$executeRawUnsafe(`DELETE FROM cinema_showtimes`);
        for (const r of results) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO cinema_showtimes
              (cinema_slug, film_title, film_description, director, genre, year, duration, poster_url, trailer_url, showtimes, source_url, scraped_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
            r.cinemaSlug, r.filmTitle, r.filmDescription || null, r.director || null,
            r.genre || null, r.year || null, r.duration || null, r.posterUrl || null,
            r.trailerUrl || null, JSON.stringify(r.showtimes || []), r.sourceUrl || null
          );
        }
        console.log(`[Cinemas] Auto-scraped ${results.length} showtimes`);
        rows = await prisma.$queryRawUnsafe(
          `SELECT * FROM cinema_showtimes ORDER BY cinema_slug, film_title`
        );
      } catch (scrapeErr: any) {
        console.error(`[Cinemas] Auto-scrape failed: ${scrapeErr.message?.slice(0, 100)}`);
      }
    }

    const cinemaMap = new Map<string, any[]>();
    for (const cinema of CINEMAS_LATINA) {
      cinemaMap.set(cinema.slug, []);
    }

    for (const row of rows) {
      const films = cinemaMap.get(row.cinema_slug);
      if (films) {
        films.push({
          id: row.id,
          filmTitle: row.film_title,
          filmDescription: row.film_description,
          director: row.director,
          genre: row.genre,
          year: row.year,
          duration: row.duration,
          posterUrl: row.poster_url,
          trailerUrl: row.trailer_url,
          showtimes: row.showtimes,
          sourceUrl: row.source_url,
          scrapedAt: row.scraped_at,
        });
      }
    }

    const cinemas = CINEMAS_LATINA.map((c) => ({
      ...c,
      films: (cinemaMap.get(c.slug) || []).sort((a, b) =>
        a.filmTitle.localeCompare(b.filmTitle)
      ),
    }));

    return jsonResponse({ cinemas });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { prisma } = await import("@/lib/prisma");
    await prisma.$executeRawUnsafe(CREATE_TABLE);

    // Clean up old MyMovies cinema events
    const deleted = await prisma.event.deleteMany({
      where: {
        OR: [
          { sourceName: { contains: "MYmovies", mode: "insensitive" } },
          { sourceUrl: { contains: "mymovies.it", mode: "insensitive" } },
        ],
      },
    });
    console.log(`[Cinemas] Deleted ${deleted.count} old MyMovies events`);

    const { runCinemaLatinaScraper } = await import(
      "@/lib/scraper/cinemaLatinaScraper"
    );
    const results = await runCinemaLatinaScraper();

    await prisma.$executeRawUnsafe(`DELETE FROM cinema_showtimes`);

    let inserted = 0;
    for (const r of results) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO cinema_showtimes
          (cinema_slug, film_title, film_description, director, genre, year, duration, poster_url, trailer_url, showtimes, source_url, scraped_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
        r.cinemaSlug,
        r.filmTitle,
        r.filmDescription || null,
        r.director || null,
        r.genre || null,
        r.year || null,
        r.duration || null,
        r.posterUrl || null,
        r.trailerUrl || null,
        JSON.stringify(r.showtimes || []),
        r.sourceUrl || null
      );
      inserted++;
    }

    return jsonResponse({
      message: "Scraping completato",
      inserted,
      total: results.length,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
