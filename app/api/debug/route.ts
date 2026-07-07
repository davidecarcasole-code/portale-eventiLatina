import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const where: any = { isPublished: true };
    where.date = { gte: new Date(new Date().toDateString()) };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: { category: true },
        orderBy: [{ date: "asc" }, { time: "asc" }],
        take: 20,
      }),
      prisma.event.count({ where }),
    ]);

    return Response.json({ ok: true, total, count: events.length, first: events[0] || null });
  } catch (err: any) {
    return Response.json({
      name: err.name,
      message: err.message,
      code: err.code,
      meta: JSON.stringify(err.meta),
      stack: err.stack?.split("\n").slice(0, 5).join("\n"),
    }, { status: 500 });
  }
}
