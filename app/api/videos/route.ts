import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { jsonResponse, handleApiError } = await import("@/lib/api-helpers");
  try {
    const { listVideos, listAllVideos, ensureVideosTable } = await import("@/lib/videos/engine");
    await ensureVideosTable();
    const all = req.nextUrl.searchParams.get("all") === "true";
    const videos = all ? await listAllVideos() : await listVideos();
    return jsonResponse({ videos });
  } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  const { jsonResponse, handleApiError, requireAdmin } = await import("@/lib/api-helpers");
  try {
    await requireAdmin(req);
    const { createVideo, ensureVideosTable } = await import("@/lib/videos/engine");
    await ensureVideosTable();
    const body = await req.json();
    const video = await createVideo(body);
    return jsonResponse({ video }, 201);
  } catch (err) { return handleApiError(err); }
}
