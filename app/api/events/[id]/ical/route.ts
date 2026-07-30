import { NextRequest } from "next/server";
import { generateIcs } from "@/lib/ics";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;

    const isNumeric = /^\d+$/.test(id);
    const event = await prisma.event.findUnique({
      where: isNumeric ? { id: parseInt(id) } : { slug: id },
    });

    if (!event || !event.date) {
      return new Response("Evento non trovato", { status: 404 });
    }

    const ics = generateIcs({
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      endDate: event.endDate?.toISOString() || null,
      time: event.time,
      location: event.location,
      city: event.city,
      address: event.address,
    });

    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${event.slug || event.id}.ics"`,
      },
    });
  } catch (err) {
    console.error("iCal Error:", err);
    return new Response("Errore interno", { status: 500 });
  }
}
