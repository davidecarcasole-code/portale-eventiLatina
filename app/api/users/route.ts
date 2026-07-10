import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, requireSuperAdmin } = await import("@/lib/api-helpers");
    await requireSuperAdmin(req);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: "desc" } });
    return jsonResponse(users.map(u => ({ ...u, passwordHash: undefined })));
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireSuperAdmin } = await import("@/lib/api-helpers");
    const { hashPassword } = await import("@/lib/auth");
    await requireSuperAdmin(req);
    const body = await req.json();
    if (!body.email || !body.password || !body.name) {
      return errorResponse("Nome, email e password sono obbligatori");
    }
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return errorResponse("Email già registrata", 409);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash: await hashPassword(body.password),
        role: body.role || "user",
      },
    });
    return jsonResponse({ id: user.id, email: user.email, name: user.name, role: user.role }, 201);
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
