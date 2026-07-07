import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let jsonResponse: any, errorResponse: any;
  try {
    const { prisma } = await import("@/lib/prisma");
    const { hashPassword, generateToken } = await import("@/lib/auth");
    const helpers = await import("@/lib/api-helpers");
    jsonResponse = helpers.jsonResponse;
    errorResponse = helpers.errorResponse;
    const { email, password, name } = await req.json();
    if (!email || !password || !name) return errorResponse("Tutti i campi sono obbligatori");
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse("Email già registrata", 409);
    const user = await prisma.user.create({
      data: { email, name, passwordHash: await hashPassword(password) },
    });
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return jsonResponse({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar }, token }, 201);
  } catch { return errorResponse ? errorResponse("Errore registrazione", 500) : Response.json({ error: "Errore registrazione" }, { status: 500 }); }
}
