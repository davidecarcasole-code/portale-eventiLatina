import { NextRequest } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { jsonResponse, handleApiError } = await import("@/lib/api-helpers");
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");
    await prisma.ad.update({ where: { id: Number(id) }, data: { clickCount: { increment: 1 } } });
    return jsonResponse({ success: true });
  } catch (err) { const { handleApiError } = await import("@/lib/api-helpers"); return handleApiError(err); }
}
