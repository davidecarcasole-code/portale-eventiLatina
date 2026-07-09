import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/api-helpers";

const DEFAULT_CATEGORIES = [
  { slug: "musica", name: "Musica", icon: "music", color: "#ef4444" },
  { slug: "teatro", name: "Teatro", icon: "theater", color: "#8b5cf6" },
  { slug: "cultura", name: "Cultura", icon: "book", color: "#3b82f6" },
  { slug: "sport", name: "Sport", icon: "trophy", color: "#10b981" },
  { slug: "natura", name: "Natura", icon: "leaf", color: "#22c55e" },
  { slug: "trekking", name: "Trekking", icon: "mountain", color: "#84cc16" },
  { slug: "montagna", name: "Montagna", icon: "mountain", color: "#06b6d4" },
  { slug: "gite", name: "Gite", icon: "car", color: "#f59e0b" },
  { slug: "spettacolo", name: "Spettacolo", icon: "sparkles", color: "#ec4899" },
  { slug: "enogastronomia", name: "Enogastronomia", icon: "wine", color: "#dc2626" },
  { slug: "bambini", name: "Bambini", icon: "baby", color: "#f97316" },
  { slug: "borghi", name: "Borghi e dintorni", icon: "map", color: "#6366f1" },
];

export async function GET(_req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");

    // Auto-create missing default categories
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        await prisma.category.create({ data: cat });
        console.log(`[Categories] Created default category: ${cat.name}`);
      }
    }

    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return jsonResponse(categories);
  } catch (err: any) {
    console.error("API Error:", err);
    return jsonResponse({ error: "Errore interno del server" }, 500);
  }
}
