import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireSuperAdmin } = await import("@/lib/api-helpers");
    const { user: admin } = await requireSuperAdmin(req);
    const { id } = await params;
    const { role } = await req.json();
    if (!["user", "admin", "super_admin"].includes(role)) return errorResponse("Ruolo non valido");
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return errorResponse("Utente non trovato", 404);
    if (target.role === "super_admin" && id !== admin.id) return errorResponse("Non puoi modificare un super admin", 403);
    await prisma.user.update({ where: { id }, data: { role } });
    return jsonResponse({ message: "Ruolo aggiornato" });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
