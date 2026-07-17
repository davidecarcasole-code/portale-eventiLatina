import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const [helpers, { prisma }] = await Promise.all([
      import("@/lib/api-helpers"),
      import("@/lib/prisma"),
    ]);
    const { user } = await helpers.requireAuth(req);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return helpers.errorResponse("Nessun file fornito");
    }

    if (!file.type.startsWith("image/")) {
      return helpers.errorResponse("Il file deve essere un'immagine");
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return helpers.errorResponse("File troppo grande (max 5MB)");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use /tmp in production (Vercel), local public in development
    const isProd = process.env.NODE_ENV === "production";
    const baseDir = isProd ? "/tmp" : join(process.cwd(), "public");
    const uploadDir = join(baseDir, "uploads", "events");
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const publicUrl = isProd 
      ? `/api/uploads/events/${fileName}` // Will need a separate route to serve from /tmp
      : `/uploads/events/${fileName}`;

    return helpers.jsonResponse({ url: publicUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return Response.json({ error: err.message || "Errore durante l'upload" }, { status: 500 });
  }
}