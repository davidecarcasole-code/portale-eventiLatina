import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const config = await prisma.searchConfig.findFirst({
      where: { name: "default" },
      include: { scrapedSources: true },
    });
    return jsonResponse(config || {});
  } catch (err) { return handleApiError(err); }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = await requireAdmin(req);
    const body = await req.json();
    const config = await prisma.searchConfig.upsert({
      where: { id: (await prisma.searchConfig.findFirst({ where: { name: "default" } }))?.id || 0 },
      update: {
        cities: body.cities,
        provinces: body.provinces,
        categories: body.categories,
        keywords: body.keywords,
        radiusKm: body.radius_km ? parseInt(body.radius_km) : null,
        autoScrape: body.auto_scrape === true,
        scrapeIntervalHours: body.scrape_interval_hours ? parseInt(body.scrape_interval_hours) : 24,
      },
      create: {
        name: "default",
        cities: body.cities,
        provinces: body.provinces,
        categories: body.categories,
        keywords: body.keywords,
        radiusKm: body.radius_km ? parseInt(body.radius_km) : null,
        autoScrape: body.auto_scrape === true,
        scrapeIntervalHours: body.scrape_interval_hours ? parseInt(body.scrape_interval_hours) : 24,
      },
    });
    return jsonResponse(config);
  } catch (err) { return handleApiError(err); }
}
