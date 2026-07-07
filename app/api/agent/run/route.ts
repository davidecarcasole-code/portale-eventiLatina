import { NextRequest } from "next/server";
import { jsonResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    return jsonResponse({ message: "Agent AI non ancora implementato", results: { source: "agent", total: 0, created: 0, errors: [] } });
  } catch (err) { return handleApiError(err); }
}
