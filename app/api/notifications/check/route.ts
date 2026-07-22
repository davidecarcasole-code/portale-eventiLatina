import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { jsonResponse, handleApiError, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const { runDailyCheck, ensureNotificationsTable } = await import("@/lib/notifications/engine");
    await ensureNotificationsTable();
    const result = await runDailyCheck(user.id);
    return jsonResponse({ message: "Notifiche aggiornate", ...result });
  } catch (err) { const { handleApiError } = await import("@/lib/api-helpers"); return handleApiError(err); }
}
