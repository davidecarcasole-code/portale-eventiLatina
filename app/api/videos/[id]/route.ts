import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const { deleteVideo } = await import("@/lib/videos/engine");
    await deleteVideo(Number(id));
    return jsonResponse({ success: true });
  } catch (err) { return handleApiError(err); }
}
