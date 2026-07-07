import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, handleApiError, requireSuperAdmin } from "@/lib/api-helpers";

export async function GET() {
  try {
    const settings = await prisma.radioSetting.findFirst();
    return jsonResponse(settings || {});
  } catch (err) { return handleApiError(err); }
}

export async function PUT(req: NextRequest) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();
    const data: any = {};
    if (body.station_name !== undefined) data.stationName = body.station_name;
    if (body.station_description !== undefined) data.stationDescription = body.station_description;
    if (body.stream_url !== undefined) data.streamUrl = body.stream_url;
    if (body.is_live !== undefined) data.isLive = body.is_live;
    if (body.current_track !== undefined) data.currentTrack = body.current_track;
    const existing = await prisma.radioSetting.findFirst();
    const settings = existing
      ? await prisma.radioSetting.update({ where: { id: existing.id }, data })
      : await prisma.radioSetting.create({ data });
    return jsonResponse(settings);
  } catch (err) { return handleApiError(err); }
}
