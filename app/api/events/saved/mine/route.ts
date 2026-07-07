import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const saved = await prisma.savedEvent.findMany({
      where: { userId: user.id },
      include: { event: { include: { category: true } } },
      orderBy: { event: { date: "asc" } },
    });
    const events = saved.map((s) => ({
      ...s.event,
      is_saved: true,
      category_name: s.event.category?.name,
      category_slug: s.event.category?.slug,
      category_icon: s.event.category?.icon,
      category_color: s.event.category?.color,
    }));
    return jsonResponse(events);
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
