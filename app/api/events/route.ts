import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
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

    const where: any = { isPublished: true };
    where.date = { gte: dateFrom ? new Date(dateFrom) : new Date(new Date().toDateString()) };
    if (dateTo) where.date.lte = new Date(dateTo);
    if (category) where.category = { slug: category };
    if (province) where.province = province;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (time_period) where.timePeriod = time_period;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: { category: true },
        orderBy: [{ date: "asc" }, { time: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    const mapped = events.map((e) => ({
      ...e,
      is_new: Math.abs(Date.now() - e.createdAt.getTime()) / 86400000 <= 7,
      category_name: e.category?.name,
      category_slug: e.category?.slug,
      category_icon: e.category?.icon,
      category_color: e.category?.color,
    }));

    return jsonResponse({
      events: mapped,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return Response.json({
      name: err.name,
      message: err.message,
      code: err.code,
      meta: JSON.stringify(err.meta),
      stack: err.stack?.split("\n").slice(0, 6).join("\n"),
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAdmin(req);
    const body = await req.json();
    if (!body.title || !body.category_id || !body.date) return errorResponse("Titolo, categoria e data sono obbligatori");
    const event = await prisma.event.create({
      data: {
        title: body.title,
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
      },
    });
    return jsonResponse(event, 201);
  } catch (err) { return handleApiError(err); }
}
