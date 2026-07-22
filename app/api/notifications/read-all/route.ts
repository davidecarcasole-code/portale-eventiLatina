import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { jsonResponse, handleApiError, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const { markAllRead } = await import("@/lib/notifications/engine");
    const result = await markAllRead(user.id);
    return jsonResponse({ updated: result.count });
  } catch (err) { const { handleApiError } = await import("@/lib/api-helpers"); return handleApiError(err); }
}
