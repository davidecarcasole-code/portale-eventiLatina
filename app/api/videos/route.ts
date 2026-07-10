import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { listVideos, listAllVideos, ensureVideosTable } = await import("@/lib/videos/engine");
    await ensureVideosTable();
    const all = req.nextUrl.searchParams.get("all") === "true";
    const videos = all ? await listAllVideos() : await listVideos();
    return jsonResponse({ videos });
  } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { createVideo, ensureVideosTable } = await import("@/lib/videos/engine");
    await ensureVideosTable();
    const body = await req.json();
    const video = await createVideo(body);
    return jsonResponse({ video }, 201);
  } catch (err) { return handleApiError(err); }
}
