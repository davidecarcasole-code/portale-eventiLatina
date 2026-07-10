import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const { id } = await params;
    const eventId = parseInt(id);

    await prisma.savedEvent.upsert({
      where: { userId_eventId: { userId: user.id, eventId } },
      update: {},
      create: { userId: user.id, eventId },
    });

    const { createNotification } = await import("@/lib/notifications/engine");

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, date: true, city: true },
    });

    if (event?.date) {
      const now = new Date();
      const diffMs = event.date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

      if (diffMs > 0 && diffDays <= 3) {
        const label = diffDays <= 1 ? "Oggi" : diffDays === 1 ? "Domani" : `Tra ${diffDays} giorni`;
        await createNotification({
          userId: user.id,
          eventId: event.id,
          type: 'upcoming_event',
          title: `${label}: ${event.title}`,
          body: event.city ? `Hai salvato questo evento a ${event.city}.` : undefined,
        });
      }
    }

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
