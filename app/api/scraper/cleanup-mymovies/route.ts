import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { jsonResponse, handleApiError, requireAdmin } = await import("@/lib/api-helpers");
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
