import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const existing = await prisma.scrapedSource.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return errorResponse("Sorgente non trovata", 404);
    const body = await req.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.url !== undefined) data.url = body.url;
    if (body.type !== undefined) data.type = body.type;
    if (body.is_active !== undefined) data.isActive = body.is_active;
    if (body.selectors !== undefined) data.selectors = body.selectors;
    if (body.city !== undefined) data.city = body.city;
    if (body.province !== undefined) data.province = body.province;
    if (body.category_id !== undefined) data.categoryId = body.category_id ? parseInt(body.category_id) : null;
    const updated = await prisma.scrapedSource.update({ where: { id: parseInt(id) }, data });
    return jsonResponse(updated);
  } catch (err) { return handleApiError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const existing = await prisma.scrapedSource.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return errorResponse("Sorgente non trovata", 404);
    await prisma.scrapedSource.delete({ where: { id: parseInt(id) } });
    return jsonResponse({ message: "Sorgente eliminata" });
  } catch (err) { return handleApiError(err); }
}
