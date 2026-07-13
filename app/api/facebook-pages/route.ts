import { NextRequest } from "next/server";
import { jsonResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    await requireAdmin(req);
    const pages = await prisma.scrapedSource.findMany({
      where: { type: 'facebook' },
      orderBy: { createdAt: 'desc' },
    });
    return jsonResponse(pages.map(p => ({ ...p, facebookAccessToken: undefined })));
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireAdmin } = await import("@/lib/api-helpers");
    await requireAdmin(req);
    const body = await req.json();
    const { name, facebookPageId, facebookAccessToken, url, isActive } = body;
    if (!name || !facebookPageId) return errorResponse("Nome e Page ID sono obbligatori");
    const page = await prisma.scrapedSource.create({
      data: {
        name,
        type: 'facebook',
        url: url || `https://www.facebook.com/${facebookPageId}`,
        facebookPageId,
        facebookAccessToken: facebookAccessToken || null,
        isActive: isActive ?? true,
      },
    });
    return jsonResponse(page, 201);
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}