import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const mod = await import("@/lib/prisma");
    const p = mod.prisma;
    const count = await p.event.count();
    return Response.json({ ok: true, count });
  } catch (err: any) {
    return Response.json({
      ok: false,
      name: err.name,
      message: err.message,
      code: err.code,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return Response.json({ error: "Not implemented yet" }, { status: 501 });
}
