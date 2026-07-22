import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { jsonResponse, authenticateRequest } = await import("@/lib/api-helpers");
    const user = await authenticateRequest(req);
    if (!user) return jsonResponse({ user: null }, 200);
    return jsonResponse({ user });
  } catch (err) {
    const { handleApiError } = await import("@/lib/api-helpers");
    return handleApiError(err);
  }
}
