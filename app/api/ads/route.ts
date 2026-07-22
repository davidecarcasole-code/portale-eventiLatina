import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { jsonResponse, handleApiError } = await import("@/lib/api-helpers");
  try {
    const { listAds, listAllAds, ensureAdsTable } = await import("@/lib/ads/engine");
    await ensureAdsTable();
    const placement = req.nextUrl.searchParams.get("placement") || undefined;
    const all = req.nextUrl.searchParams.get("all") === "true";
    const ads = all ? await listAllAds() : await listAds(placement);
    return jsonResponse({ ads });
  } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  const { jsonResponse, handleApiError, requireAdmin } = await import("@/lib/api-helpers");
  try {
    await requireAdmin(req);
    const { createAd, ensureAdsTable } = await import("@/lib/ads/engine");
    await ensureAdsTable();
    const body = await req.json();
    const ad = await createAd(body);
    return jsonResponse({ ad }, 201);
  } catch (err) { return handleApiError(err); }
}
