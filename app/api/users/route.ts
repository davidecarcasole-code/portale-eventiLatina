import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, requireSuperAdmin } = await import("@/lib/api-helpers");
    await requireSuperAdmin(req);
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return jsonResponse(users);
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
