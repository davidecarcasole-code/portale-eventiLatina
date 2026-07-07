import { NextRequest } from "next/server";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, handleApiError } = await import("@/lib/api-helpers");
    const podcasts = await prisma.radioPodcast.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    return jsonResponse(podcasts);
  } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, handleApiError, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    if (user.role !== "super_admin") return errorResponse("Accesso negato", 403);
    const body = await req.json();
    if (!body.title) return errorResponse("Titolo richiesto");
    const podcast = await prisma.radioPodcast.create({
      data: {
        title: body.title,
        description: body.description,
        filePath: body.file_path,
        duration: body.duration ? parseInt(body.duration) : null,
        fileSize: body.file_size ? parseInt(body.file_size) : null,
        fileType: body.file_type,
        isPublished: body.is_published !== false,
        createdBy: user.id,
      },
    });
    return jsonResponse(podcast, 201);
  } catch (err) { return handleApiError(err); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, handleApiError, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    if (user.role !== "super_admin") return errorResponse("Accesso negato", 403);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("ID richiesto");
    await prisma.radioPodcast.delete({ where: { id: parseInt(id) } });
    return jsonResponse({ message: "Podcast eliminato" });
  } catch (err) { return handleApiError(err); }
}
