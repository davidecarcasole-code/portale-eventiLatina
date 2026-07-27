import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const [helpers, { prisma }] = await Promise.all([
      import("@/lib/api-helpers"),
      import("@/lib/prisma"),
    ]);
    const { requireAdmin } = await import("@/lib/api-helpers");
    await requireAdmin(req);

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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

    const [
      totalVisits,
      todayVisits,
      yesterdayVisits,
      weekVisits,
      monthVisits,
      uniqueVisitorsMonth,
      visitsByDay,
      topPages,
      referrers,
    ] = await Promise.all([
      prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*)::int as count FROM page_visits`),
      prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*)::int as count FROM page_visits WHERE created_at >= $1`, today),
      prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*)::int as count FROM page_visits WHERE created_at >= $1 AND created_at < $2`, yesterday, today),
      prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*)::int as count FROM page_visits WHERE created_at >= $1`, weekAgo),
      prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*)::int as count FROM page_visits WHERE created_at >= $1`, monthAgo),
      prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(DISTINCT ip_hash)::int as count FROM page_visits WHERE created_at >= $1`, monthAgo),
      prisma.$queryRawUnsafe<{ day: string; count: bigint; unique: bigint }[]>(`
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as day, COUNT(*)::int as count, COUNT(DISTINCT ip_hash)::int as unique
        FROM page_visits WHERE created_at >= $1
        GROUP BY day ORDER BY day
      `, monthAgo),
      prisma.$queryRawUnsafe<{ path: string; count: bigint }[]>(`
        SELECT path, COUNT(*)::int as count FROM page_visits
        WHERE created_at >= $1
        GROUP BY path ORDER BY count DESC LIMIT 10
      `, monthAgo),
      prisma.$queryRawUnsafe<{ referrer: string; count: bigint }[]>(`
        SELECT COALESCE(referrer, 'Diretto') as referrer, COUNT(*)::int as count FROM page_visits
        WHERE created_at >= $1
        GROUP BY referrer ORDER BY count DESC LIMIT 10
      `, monthAgo),
    ]);

    return helpers.jsonResponse({
      overview: {
        total: totalVisits[0]?.count ?? 0,
        today: todayVisits[0]?.count ?? 0,
        yesterday: yesterdayVisits[0]?.count ?? 0,
        thisWeek: weekVisits[0]?.count ?? 0,
        thisMonth: monthVisits[0]?.count ?? 0,
        uniqueVisitors: uniqueVisitorsMonth[0]?.count ?? 0,
      },
      visitsByDay: visitsByDay.map(r => ({ day: r.day, count: r.count, unique: r.unique })),
      topPages: topPages.map(r => ({ path: r.path, count: r.count })),
      referrers: referrers.map(r => ({ referrer: r.referrer, count: r.count })),
    });
  } catch (err: any) {
    console.error("[StatsVisits]", err);
    return Response.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
