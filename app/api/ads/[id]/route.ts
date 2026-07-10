import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const { updateAd } = await import("@/lib/ads/engine");
    const ad = await updateAd(Number(id), body);
    return jsonResponse({ ad });
  } catch (err) { return handleApiError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const { deleteAd } = await import("@/lib/ads/engine");
    await deleteAd(Number(id));
    return jsonResponse({ success: true });
  } catch (err) { return handleApiError(err); }
}
