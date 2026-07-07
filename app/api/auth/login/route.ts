import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateToken } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return errorResponse("Email e password richieste");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return errorResponse("Credenziali non valide", 401);
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return errorResponse("Credenziali non valide", 401);
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return jsonResponse({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, theme: user.theme, accent_color: user.accentColor }, token });
  } catch { return errorResponse("Errore login", 500); }
}
