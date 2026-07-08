import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { source } = await req.json().catch(() => ({}));
    const { runScraper } = await import("@/lib/scraper/engine");
    const results = await runScraper(source || undefined);
    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
    return jsonResponse({ message: "Scraper completato", results, totalInserted });
  } catch (err) { return handleApiError(err); }
}
