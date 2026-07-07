import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, handleApiError, requireSuperAdmin } = await import("@/lib/api-helpers");
    await requireSuperAdmin(req);
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return jsonResponse(users);
  } catch (err) { return handleApiError(err); }
}
