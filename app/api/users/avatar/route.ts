export const maxDuration = 30;

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const body = await req.json();
    const { dataUrl } = body;
    if (!dataUrl || typeof dataUrl !== "string") return errorResponse("dataUrl mancante o non valido");
    if (!dataUrl.startsWith("data:image/")) return errorResponse("Formato immagine non valido");
    if (dataUrl.length > 500_000) return errorResponse("Immagine troppo grande (max 500KB)");
    await prisma.user.update({ where: { id: user.id }, data: { avatar: dataUrl } });
    return jsonResponse({ avatar: dataUrl });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
