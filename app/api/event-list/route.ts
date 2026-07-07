import { NextRequest } from "next/server";

export async function GET() {
  try {
    const mod = await import("@/lib/prisma");
    const events = await mod.prisma.event.findMany({
      where: { isPublished: true, date: { gte: new Date(new Date().toDateString()) } },
      include: { category: true },
      orderBy: { date: "asc" },
      take: 20,
    });
    return Response.json({ ok: true, count: events.length, events });
  } catch (err: any) {
    return Response.json({ ok: false, message: err.message, code: err.code }, { status: 500 });
  }
}
