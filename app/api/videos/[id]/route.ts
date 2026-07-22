import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { jsonResponse, handleApiError, requireAdmin } = await import("@/lib/api-helpers");
  try {
    await requireAdmin(req);
    const { id } = await params;
    const { deleteVideo } = await import("@/lib/videos/engine");
    await deleteVideo(Number(id));
    return jsonResponse({ success: true });
  } catch (err) { return handleApiError(err); }
}
