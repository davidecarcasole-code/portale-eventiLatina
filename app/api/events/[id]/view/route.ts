import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");
    const isNumeric = /^\d+$/.test(id);
    const where = isNumeric ? { id: parseInt(id) } : { slug: id };
    await prisma.event.updateMany({ where, data: { viewCount: { increment: 1 } } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
