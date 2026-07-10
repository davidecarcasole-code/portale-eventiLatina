import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAuth } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { getNotifications, ensureNotificationsTable } = await import("@/lib/notifications/engine");
    await ensureNotificationsTable();
    const result = await getNotifications(user.id);
    return jsonResponse(result);
  } catch (err) { return handleApiError(err); }
}
