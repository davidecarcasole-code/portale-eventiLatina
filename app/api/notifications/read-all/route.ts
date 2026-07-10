import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAuth } from "@/lib/api-helpers";

export async function PUT(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { markAllRead } = await import("@/lib/notifications/engine");
    const result = await markAllRead(user.id);
    return jsonResponse({ updated: result.count });
  } catch (err) { return handleApiError(err); }
}
