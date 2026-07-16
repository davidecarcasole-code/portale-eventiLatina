import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { prisma } = await import("@/lib/prisma");

    const deleted = await prisma.event.deleteMany({
      where: {
        OR: [
          { sourceName: { contains: "MYmovies", mode: "insensitive" } },
          { sourceUrl: { contains: "mymovies.it", mode: "insensitive" } },
        ],
      },
    });

    return jsonResponse({ deleted: deleted.count });
  } catch (err) {
    return handleApiError(err);
  }
}
