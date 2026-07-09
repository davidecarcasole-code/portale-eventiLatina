import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/api-helpers";

export async function GET(_req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return jsonResponse(categories);
  } catch (err: any) {
    console.error("API Error:", err);
    return jsonResponse({ error: "Errore interno del server" }, 500);
  }
}
