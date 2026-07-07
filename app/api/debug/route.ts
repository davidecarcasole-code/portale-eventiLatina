import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL || "NOT SET";
  const masked = dbUrl === "NOT SET" ? dbUrl : dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");

  let pgResult: any = "not tested";
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 8000 });
    const client = await pool.connect();
    const res = await client.query("SELECT NOW() as time");
    client.release();
    await pool.end();
    pgResult = "ok: " + res.rows[0].time;
  } catch (err: any) {
    pgResult = "err: " + err.message + " | code: " + err.code;
  }

  return Response.json({ url: masked, pg: pgResult });
}
