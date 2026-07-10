import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAuth } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { runDailyCheck, ensureNotificationsTable } = await import("@/lib/notifications/engine");
    await ensureNotificationsTable();
    const result = await runDailyCheck(user.id);
    return jsonResponse({ message: "Notifiche aggiornate", ...result });
  } catch (err) { return handleApiError(err); }
}
