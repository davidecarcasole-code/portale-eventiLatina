import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    return jsonResponse({ centroitalia: 0, latinatoday: 0, lazionascosto: 0 });
  } catch (err) { return handleApiError(err); }
}
