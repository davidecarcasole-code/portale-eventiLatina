import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    const masked = dbUrl.replace(/\/\/.*@/, "//***@").replace(/:.*@/, ":***@");
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.event.count();
    return Response.json({ dbUrl: masked, eventCount: count, ok: true });
  } catch (err: any) {
    return Response.json({
      error: err.message,
      stack: err.stack?.split("\n").slice(0, 5).join("\n"),
    }, { status: 500 });
  }
}
