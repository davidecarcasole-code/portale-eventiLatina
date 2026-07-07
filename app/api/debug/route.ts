import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL || "NOT SET";
  const masked = dbUrl === "NOT SET" ? dbUrl : dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  const allEnv = Object.keys(process.env).filter(k => !k.includes("SECRET") && !k.includes("KEY") && !k.includes("PASS"));
  
  let prismaResult: any = "not tested";
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.event.count();
    prismaResult = { ok: true, count };
  } catch (err: any) {
    prismaResult = { error: err.message, stack: err.stack?.split("\n").slice(0, 3).join("\n") };
  }

  return Response.json({ dbUrl: masked, envKeys: allEnv, prisma: prismaResult });
}
