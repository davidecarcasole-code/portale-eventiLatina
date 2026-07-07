import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { jsonResponse, errorResponse, handleApiError, requireAuth } = await import("@/lib/api-helpers");
    const { user } = await requireAuth(req);
    const { dataUrl } = await req.json();
    if (!dataUrl || typeof dataUrl !== "string") return errorResponse("dataUrl mancante o non valido");
    const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) return errorResponse("Formato data URL non valido");
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");
    const dir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(dir, { recursive: true });
    const filename = `${user.id}.${ext}`;
    await writeFile(path.join(dir, filename), buffer);
    const avatarUrl = `/uploads/avatars/${filename}`;
    await prisma.user.update({ where: { id: user.id }, data: { avatar: avatarUrl } });
    return jsonResponse({ avatar: avatarUrl });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return handleApiError(err);
  }
}
