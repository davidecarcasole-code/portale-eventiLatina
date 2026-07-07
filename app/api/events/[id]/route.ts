import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, handleApiError, requireAdmin, authenticateRequest } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });
    if (!event) return errorResponse("Evento non trovato", 404);
    const user = await authenticateRequest(req);
    let is_saved = false;
    if (user) {
      const saved = await prisma.savedEvent.findUnique({
        where: { userId_eventId: { userId: user.id, eventId: event.id } },
      });
      is_saved = !!saved;
    }
    return jsonResponse({
      ...event,
      is_new: Math.abs(Date.now() - event.createdAt.getTime()) / 86400000 <= 7,
      category_name: event.category?.name,
      category_slug: event.category?.slug,
      category_icon: event.category?.icon,
      category_color: event.category?.color,
      is_saved,
    });
  } catch (err) { return handleApiError(err); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const existing = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return errorResponse("Evento non trovato", 404);
    const body = await req.json();
    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.category_id !== undefined) data.categoryId = parseInt(body.category_id);
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.end_date !== undefined) data.endDate = body.end_date ? new Date(body.end_date) : null;
    if (body.time !== undefined) data.time = body.time;
    if (body.location !== undefined) data.location = body.location;
    if (body.address !== undefined) data.address = body.address;
    if (body.city !== undefined) data.city = body.city;
    if (body.province !== undefined) data.province = body.province;
    if (body.image_url !== undefined) data.imageUrl = body.image_url;
    if (body.source_url !== undefined) data.sourceUrl = body.source_url;
    if (body.source_name !== undefined) data.sourceName = body.source_name;
    if (body.is_published !== undefined) data.isPublished = body.is_published;

    const event = await prisma.event.update({ where: { id: parseInt(id) }, data, include: { category: true } });
    return jsonResponse(event);
  } catch (err) { return handleApiError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const existing = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return errorResponse("Evento non trovato", 404);
    await prisma.event.delete({ where: { id: parseInt(id) } });
    return jsonResponse({ message: "Evento eliminato" });
  } catch (err) { return handleApiError(err); }
}
