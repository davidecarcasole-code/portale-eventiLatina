import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL || "NOT SET";
  const masked = dbUrl === "NOT SET" ? dbUrl : dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");

  // Test direct pg connection without Prisma
  let pgResult: any = "not tested";
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 5000 });
    const client = await pool.connect();
    const res = await client.query("SELECT NOW() as time");
    client.release();
    await pool.end();
    pgResult = { ok: true, time: res.rows[0].time };
  } catch (err: any) {
    pgResult = { error: err.message, code: err.code };
  }

  // Test Prisma
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
      meta: JSON.stringify(err.meta),
      full: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    };
  }

  return Response.json({ dbUrl: masked, pg: pgResult, prisma: prismaResult });
}
