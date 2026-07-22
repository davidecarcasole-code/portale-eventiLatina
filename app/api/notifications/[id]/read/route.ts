import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { jsonResponse, handleApiError, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const { id } = await params;
    const { markRead } = await import("@/lib/notifications/engine");
    const result = await markRead(Number(id), user.id);
    return jsonResponse({ updated: result.count });
  } catch (err) { const { handleApiError } = await import("@/lib/api-helpers"); return handleApiError(err); }
}
