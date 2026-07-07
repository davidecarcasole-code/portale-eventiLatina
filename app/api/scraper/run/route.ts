import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    return jsonResponse({ message: "Scraper avviato", results: { total: 0, created: 0, errors: [] } });
  } catch (err) { return handleApiError(err); }
}
