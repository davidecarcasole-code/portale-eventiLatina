import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-helpers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;
    await prisma.savedEvent.upsert({
      where: { userId_eventId: { userId: user.id, eventId: parseInt(id) } },
      update: {},
      create: { userId: user.id, eventId: parseInt(id) },
    });
    return jsonResponse({ message: "Evento salvato" });
  } catch (err) { return handleApiError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;
    await prisma.savedEvent.deleteMany({
      where: { userId: user.id, eventId: parseInt(id) },
    });
    return jsonResponse({ message: "Evento rimosso dai salvati" });
  } catch (err) { return handleApiError(err); }
}
