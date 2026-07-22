import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");
    await prisma.$executeRawUnsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0`);
    await prisma.$executeRawUnsafe(`UPDATE events SET view_count = view_count + 1 WHERE id = $1`, parseInt(id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
