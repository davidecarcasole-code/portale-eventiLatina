import { NextRequest } from "next/server";
import { jsonResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireAdmin } = await import("@/lib/api-helpers");
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const { name, facebookPageId, facebookAccessToken, url, isActive } = body;
    const page = await prisma.scrapedSource.update({
      where: { id: parseInt(id) },
      data: {
        name,
        facebookPageId,
        facebookAccessToken,
        url,
        isActive,
      },
    });
    return jsonResponse({ ...page, facebookAccessToken: undefined });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireAdmin } = await import("@/lib/api-helpers");
    await requireAdmin(req);
    const { id } = await params;
    await prisma.scrapedSource.delete({ where: { id: parseInt(id) } });
    return jsonResponse({ message: "Pagina Facebook eliminata" });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}