import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const { id } = await params;
    await prisma.savedEvent.upsert({
      where: { userId_eventId: { userId: user.id, eventId: parseInt(id) } },
      update: {},
      create: { userId: user.id, eventId: parseInt(id) },
    });
    return jsonResponse({ message: "Evento salvato" });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const { id } = await params;
    await prisma.savedEvent.deleteMany({
      where: { userId: user.id, eventId: parseInt(id) },
    });
    return jsonResponse({ message: "Evento rimosso dai salvati" });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
