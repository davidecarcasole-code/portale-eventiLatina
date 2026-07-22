import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { jsonResponse, handleApiError, requireAdmin } = await import("@/lib/api-helpers");
  try {
    await requireAdmin(req);
    const { previewScraper } = await import("@/lib/scraper/engine");
    const events = await previewScraper();
    return jsonResponse({ events, total: events.length });
  } catch (err) { return handleApiError(err); }
}
