import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS page_visits (
        id SERIAL PRIMARY KEY,
        path TEXT NOT NULL,
        referrer TEXT,
        user_agent TEXT,
        ip_hash TEXT,
        session_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON page_visits(created_at)
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_page_visits_path ON page_visits(path)
    `);

    const body = await req.json().catch(() => ({}));
    const path = body.path || "/";
    const referrer = req.headers.get("referer") || null;
    const userAgent = req.headers.get("user-agent") || null;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashString(ip);
    const sessionId = body.session_id || null;

    await prisma.$executeRawUnsafe(
      `INSERT INTO page_visits (path, referrer, user_agent, ip_hash, session_id) VALUES ($1, $2, $3, $4, $5)`,
      path, referrer, userAgent, ipHash, sessionId
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[TrackVisit]", err);
    return Response.json({ ok: false });
  }
}

async function hashString(str: string): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(str).digest("hex").slice(0, 16);
}
