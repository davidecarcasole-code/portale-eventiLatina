import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, handleApiError, requireSuperAdmin } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin(req);
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return jsonResponse(users);
  } catch (err) { return handleApiError(err); }
}
