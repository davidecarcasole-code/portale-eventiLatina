import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireAdmin } = await import("@/lib/api-helpers");
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const users = await prisma.user.findMany({
      where: { role: "publisher", publisherStatus: status },
      orderBy: { createdAt: "desc" },
    });
    return jsonResponse(users);
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireAdmin } = await import("@/lib/api-helpers");
    await requireAdmin(req);
    const body = await req.json();
    const { id, publisherStatus } = body;
    if (!id || !publisherStatus) return errorResponse("ID e publisherStatus obbligatori");
    const user = await prisma.user.update({
      where: { id },
      data: { publisherStatus },
    });
    return jsonResponse(user);
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}