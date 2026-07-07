import { NextRequest } from "next/server";

export async function GET() {
  let ok = false;
  let count = -1;
  let error = "";
  try {
    const { prisma } = await import("@/lib/prisma");
    count = await prisma.event.count();
    ok = true;
  } catch (err: any) {
    error = err.message + " | code: " + err.code;
  }
  return Response.json({ ok, count, error });
}
