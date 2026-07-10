import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireSuperAdmin } = await import("@/lib/api-helpers");
    await requireSuperAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.role !== undefined) data.role = body.role;
    if (body.publisherStatus !== undefined) data.publisherStatus = body.publisherStatus;
    const user = await prisma.user.update({ where: { id }, data });
    return jsonResponse({ ...user, passwordHash: undefined });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, requireSuperAdmin } = await import("@/lib/api-helpers");
    await requireSuperAdmin(req);
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return jsonResponse({ message: "Utente eliminato" });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Errore interno del server" }, { status: 500 });
  }
}