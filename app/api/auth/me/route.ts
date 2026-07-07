import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, authenticateRequest } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) return jsonResponse({ user: null }, 200);
    return jsonResponse({ user });
  } catch (err) { return handleApiError(err); }
}
