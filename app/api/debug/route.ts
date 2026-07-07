import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL || "NOT SET";
  const masked = dbUrl === "NOT SET" ? dbUrl : dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");

  let prismaResult: any = "not tested";
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.event.count();
    prismaResult = { ok: true, count };
  } catch (err: any) {
    prismaResult = {
      name: err.name,
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: err.stack?.split("\n").slice(0, 4).join("\n"),
      full: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    };
  }

  return Response.json({ dbUrl: masked, prisma: prismaResult });
}
