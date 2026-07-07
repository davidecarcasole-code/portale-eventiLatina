import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, handleApiError, requireSuperAdmin } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user: admin } = await requireSuperAdmin(req);
    const { id } = await params;
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return errorResponse("Utente non trovato", 404);
    if (target.role === "super_admin" && id !== admin.id) return errorResponse("Non puoi modificare un super admin", 403);
    const body = await req.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.role !== undefined) data.role = body.role;
    if (body.theme !== undefined) data.theme = body.theme;
    if (body.accent_color !== undefined) data.accentColor = body.accent_color;
    await prisma.user.update({ where: { id }, data });
    return jsonResponse({ message: "Utente aggiornato" });
  } catch (err) { return handleApiError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user: admin } = await requireSuperAdmin(req);
    const { id } = await params;
    if (id === admin.id) return errorResponse("Non puoi eliminare te stesso", 400);
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return errorResponse("Utente non trovato", 404);
    if (target.role === "super_admin") return errorResponse("Non puoi eliminare un super admin", 403);
    await prisma.user.delete({ where: { id } });
    return jsonResponse({ message: "Utente eliminato" });
  } catch (err) { return handleApiError(err); }
}
