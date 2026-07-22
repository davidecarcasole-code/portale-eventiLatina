import { NextRequest } from "next/server";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";

async function ensureSchema() {
  const { prisma } = await import("@/lib/prisma");
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS publisher_status TEXT
    `);

    const { generateSlug: gs, ensureUniqueSlug: eus } = await import("@/lib/slug");
    const missingSlug = await prisma.$queryRawUnsafe<{id: number, title: string}[]>(
      `SELECT id, title FROM events WHERE slug IS NULL OR slug = ''`
    );
    if (missingSlug.length > 0) {
      const existingSlugs = new Set(
        ((await prisma.$queryRawUnsafe<{slug: string}[]>(
          `SELECT slug FROM events WHERE slug IS NOT NULL AND slug != ''`
        )).map((r: any) => r.slug))
      );
      for (const row of missingSlug) {
        const base = gs(row.title);
        const slug = eus(base, existingSlugs);
        existingSlugs.add(slug);
        await prisma.$executeRawUnsafe(
          `UPDATE events SET slug = $1 WHERE id = $2`,
          slug, row.id
        );
      }
      console.log(`[Events] Backfilled slugs for ${missingSlug.length} events`);
    }
  } catch (err) {
    console.error('[Events] Schema ensure failed:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureSchema();
    const [helpers, { prisma }] = await Promise.all([
      import("@/lib/api-helpers"),
      import("@/lib/prisma"),
    ]);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const time_period = searchParams.get("time_period");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status") || "approved";
    const timeFilter = searchParams.get("timeFilter") || "upcoming";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const where: any = { isPublished: true };
    if (status !== "all") where.status = status;

    if (timeFilter === "all") {
      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom);
        if (dateTo) where.date.lte = new Date(dateTo);
      }
    } else if (timeFilter === "upcoming") {
      where.date = { gte: dateFrom ? new Date(dateFrom) : today };
      if (dateTo) where.date.lte = new Date(dateTo);
    } else if (timeFilter === "ongoing") {
      where.date = { lte: today };
      where.endDate = { gte: today };
    } else if (timeFilter === "past") {
      where.date = { lt: today };
    } else {
      where.date = { gte: dateFrom ? new Date(dateFrom) : today };
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    if (category) {
      const slugs = category.split(',').map(s => s.trim()).filter(Boolean);
      if (slugs.length === 1) where.category = { slug: slugs[0] };
      else if (slugs.length > 1) where.category = { slug: { in: slugs } };
    }
    const excludeCategory = searchParams.get("excludeCategory");
    if (excludeCategory) {
      const excludeSlugs = excludeCategory.split(',').map(s => s.trim()).filter(Boolean);
      if (excludeSlugs.length > 0) {
        if (category) {
          where.category = { slug: { in: category.split(',').map(s => s.trim()).filter(Boolean), notIn: excludeSlugs } };
        } else {
          where.category = { slug: { notIn: excludeSlugs } };
        }
      }
    }
    if (province === "PROVINCIA") {
      where.province = { in: ["RM", "FR", "RI", "VT"] };
    } else if (province) {
      // Strict filter: only Latina city or LT province
      if (province === "LT") {
        where.OR = [
          { province: "LT" },
          { city: { equals: "Latina", mode: "insensitive" } }
        ];
      } else {
        where.province = province;
      }
    }
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (time_period) where.timePeriod = time_period;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    let events = await prisma.event.findMany({
      where,
      include: { category: true },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Prioritize Latina province (LT) events over other provinces
    events.sort((a, b) => {
      const aIsLT = a.province === "LT" ? 0 : 1;
      const bIsLT = b.province === "LT" ? 0 : 1;
      if (aIsLT !== bIsLT) return aIsLT - bIsLT;
      const aTime = a.date?.getTime() ?? 0;
      const bTime = b.date?.getTime() ?? 0;
      return aTime - bTime;
    });

    const total = await prisma.event.count({ where });

    const mapped = events.map((e: any) => ({
      ...e,
      slug: e.slug,
      is_new: Math.abs(Date.now() - e.createdAt.getTime()) / 86400000 <= 7,
      category_name: e.category?.name,
      category_slug: e.category?.slug,
      category_icon: e.category?.icon,
      category_color: e.category?.color,
      source_url: e.sourceUrl,
      source_name: e.sourceName,
      end_date: e.endDate,
      image_url: e.imageUrl,
      time_period: e.timePeriod,
      is_auto_generated: e.isAutoGenerated,
      is_published: e.isPublished,
    }));

    return helpers.jsonResponse({
      events: mapped,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const [helpers, { prisma }] = await Promise.all([
      import("@/lib/api-helpers"),
      import("@/lib/prisma"),
    ]);
    const { user } = await helpers.requireAuth(req);
    const body = await req.json();
    if (!body.title || !body.category_id || !body.date) {
      return helpers.errorResponse("Titolo, categoria e data sono obbligatori");
    }
    const isAdmin = user.role === "admin" || user.role === "super_admin";
    const eventStatus = isAdmin ? "approved" : "pending";

    const { generateSlug: gs, ensureUniqueSlug: eus } = await import("@/lib/slug");
    const baseSlug = gs(body.title);
    const existingSlugs = new Set(
      ((await prisma.$queryRawUnsafe<{slug: string}[]>(
        `SELECT slug FROM events WHERE slug IS NOT NULL AND slug != ''`
      )).map((r: any) => r.slug))
    );
    const slug = eus(baseSlug, existingSlugs);

    const event = await prisma.event.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        categoryId: parseInt(body.category_id),
        date: new Date(body.date),
        endDate: body.end_date ? new Date(body.end_date) : null,
        time: body.time,
        location: body.location,
        address: body.address,
        city: body.city || "Latina",
        province: body.province || "LT",
        imageUrl: body.image_url,
        sourceUrl: body.source_url,
        sourceName: body.source_name,
        createdBy: user.id,
        status: eventStatus,
      },
    });
    return helpers.jsonResponse(event, 201);
  } catch (err: any) {
    return handleError(err);
  }
}

function handleError(err: any) {
  if (err.name === "AuthError") {
    return Response.json({ error: err.message }, { status: err.status || 401 });
  }
  console.error("API Error:", err);
  return Response.json({ error: "Errore interno del server" }, { status: 500 });
}
