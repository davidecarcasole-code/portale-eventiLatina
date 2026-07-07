import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { previewScraper } = await import("@/lib/scraper/engine");
    const events = await previewScraper();
    return jsonResponse({ events, total: events.length });
  } catch (err) { return handleApiError(err); }
}
