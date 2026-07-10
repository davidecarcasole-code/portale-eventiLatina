import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAuth } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;
    const { markRead } = await import("@/lib/notifications/engine");
    const result = await markRead(Number(id), user.id);
    return jsonResponse({ updated: result.count });
  } catch (err) { return handleApiError(err); }
}
