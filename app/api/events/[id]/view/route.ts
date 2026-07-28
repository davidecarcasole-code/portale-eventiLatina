import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");
    const isNumeric = /^\d+$/.test(id);
    const where = isNumeric ? { id: parseInt(id) } : { slug: id };

    const event = await prisma.event.findFirst({ where, select: { id: true } });
    if (!event) return Response.json({ ok: false });

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS event_views (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_event_views_event_id ON event_views(event_id)
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_event_views_created_at ON event_views(created_at)
    `);

    await Promise.all([
      prisma.event.updateMany({ where, data: { viewCount: { increment: 1 } } }),
      prisma.$executeRawUnsafe(
        `INSERT INTO event_views (event_id) VALUES ($1)`,
        event.id
      ),
    ]);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
