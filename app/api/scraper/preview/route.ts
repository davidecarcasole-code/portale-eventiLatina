import { NextRequest } from "next/server";
import { jsonResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    return jsonResponse([]);
  } catch (err) { return handleApiError(err); }
}
