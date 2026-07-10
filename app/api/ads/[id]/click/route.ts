import { NextRequest } from "next/server";
import { jsonResponse, handleApiError } from "@/lib/api-helpers";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");
    await prisma.ad.update({ where: { id: Number(id) }, data: { clickCount: { increment: 1 } } });
    return jsonResponse({ success: true });
  } catch (err) { return handleApiError(err); }
}
