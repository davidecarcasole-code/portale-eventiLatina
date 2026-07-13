import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

const CRON_SECRET = process.env.CRON_SECRET || "vercel-cron-secret";

export async function POST(req: NextRequest) {
  try {
    const isCron = req.headers.get("x-vercel-cron") === "1" || req.headers.get("authorization") === `Bearer ${CRON_SECRET}`;
    if (!isCron) await requireAdmin(req);
    const { source } = await req.json().catch(() => ({}));
    const { runScraper } = await import("@/lib/scraper/engine");
    const results = await runScraper(source || undefined);
    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
    return jsonResponse({ message: "Scraper completato", results, totalInserted });
  } catch (err) { return handleApiError(err); }
}
