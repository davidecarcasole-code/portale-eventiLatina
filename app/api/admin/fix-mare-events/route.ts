import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const mareCategory = 18;
  
  const eventIdsToReclassify = [
    478, // Mercatino Antiquariato & Artigianato - San Felice Circeo
    217, // Raduno Circeo in Vespa
    222, // La Rotta di Circe
    407, // Immersioni Sonore 2026
    476, // LAZIOSound: Santa Marinella
    246, // Sabaudia Festa della Birra
    498, // XVI Festa della Birra Sabaudia
    495, // XVI Festa della Birra Sabaudia
    493, // XVI Festa della Birra Sabaudia
    221, // Sabaudia Jazz 2026
    353, // Formia Festival Teatro Classico
    459, // Sabaudia Il Parco e la Commedia
    429, // Formia Gastronomia e Folklore
    483, // Terracina di Notte
  ];

  const result = await prisma.event.updateMany({
    where: { id: { in: eventIdsToReclassify } },
    data: { categoryId: mareCategory },
  });

  return NextResponse.json({ updated: result.count, ids: eventIdsToReclassify });
}
