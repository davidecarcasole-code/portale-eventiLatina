import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const u = await prisma.user.findUnique({ where: { id: user.id } });
    if (!u) return errorResponse("Utente non trovato", 404);
    return jsonResponse({ id: u.id, email: u.email, name: u.name, role: u.role, avatar: u.avatar, theme: u.theme, accent_color: u.accentColor });
  } catch (err) { return handleApiError(err); }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { name, avatar, theme, accent_color } = await req.json();
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (avatar !== undefined) data.avatar = avatar;
    if (theme !== undefined) data.theme = theme;
    if (accent_color !== undefined) data.accentColor = accent_color;
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return jsonResponse({ id: updated.id, email: updated.email, name: updated.name, role: updated.role, avatar: updated.avatar, theme: updated.theme, accent_color: updated.accentColor });
  } catch (err) { return handleApiError(err); }
}
