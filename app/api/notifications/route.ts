import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { jsonResponse, handleApiError, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const { getNotifications, ensureNotificationsTable } = await import("@/lib/notifications/engine");
    await ensureNotificationsTable();
    const result = await getNotifications(user.id);
    return jsonResponse(result);
  } catch (err) { const { handleApiError } = await import("@/lib/api-helpers"); return handleApiError(err); }
}
