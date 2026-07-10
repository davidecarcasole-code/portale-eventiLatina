async function getPrisma() {
  const mod = await import("@/lib/prisma");
  return mod.prisma;
}

export async function ensureNotificationsTable() {
  const prisma = await getPrisma();
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
        type TEXT NOT NULL DEFAULT 'general',
        title TEXT NOT NULL,
        body TEXT,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('[Notif] Ensured notifications table');
  } catch (err) {
    console.error('[Notif] Failed to ensure notifications table:', err);
  }
}

export async function createNotification(params: {
  userId: string;
  eventId?: number;
  type: 'upcoming_event' | 'recommendation' | 'general';
  title: string;
  body?: string;
}) {
  const prisma = await getPrisma();
  return prisma.notification.create({ data: params });
}

export async function getNotifications(userId: string, limit = 20) {
  const prisma = await getPrisma();
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { event: { select: { id: true, title: true, date: true, imageUrl: true } } },
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { items, unreadCount };
}

export async function markRead(id: number, userId: string) {
  const prisma = await getPrisma();
  return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
}

export async function markAllRead(userId: string) {
  const prisma = await getPrisma();
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

export async function checkUpcomingEvents(userId: string) {
  const prisma = await getPrisma();
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  const savedEvents = await prisma.savedEvent.findMany({
    where: {
      userId,
      event: {
        isPublished: true,
        date: { not: null, gte: now, lte: in3Days },
      },
    },
    include: { event: { select: { id: true, title: true, date: true, city: true } } },
  });

  let created = 0;
  for (const se of savedEvents) {
    if (!se.event.date) continue;
    const diffMs = se.event.date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

    const existing = await prisma.notification.findFirst({
      where: { userId, eventId: se.eventId, type: 'upcoming_event' },
    });
    if (existing) continue;

    let title: string;
    let body: string;
    if (diffDays <= 1) {
      title = `🗓 Oggi: ${se.event.title}`;
      body = `L'evento che hai salvato si tiene oggi${se.event.city ? ` a ${se.event.city}` : ''}!`;
    } else if (diffDays === 1) {
      title = `⏰ Domani: ${se.event.title}`;
      body = `L'evento che hai salvato è domani${se.event.city ? ` a ${se.event.city}` : ''}.`;
    } else {
      title = `📅 Tra ${diffDays} giorni: ${se.event.title}`;
      body = `L'evento che hai salvato è tra ${diffDays} giorni${se.event.city ? ` a ${se.event.city}` : ''}.`;
    }

    await createNotification({
      userId,
      eventId: se.eventId,
      type: 'upcoming_event',
      title: title.slice(0, 200),
      body: body?.slice(0, 500) || undefined,
    });
    created++;
  }

  return created;
}

export async function checkRecommendations(userId: string) {
  const prisma = await getPrisma();

  const savedCats = await prisma.savedEvent.findMany({
    where: { userId },
    include: { event: { select: { categoryId: true } } },
  });
  const catIds = [...new Set(savedCats.map((s) => s.event.categoryId).filter(Boolean))] as number[];
  if (catIds.length === 0) return 0;

  const now = new Date();
  const recentEvents = await prisma.event.findMany({
    where: {
      isPublished: true,
      categoryId: { in: catIds },
      date: { gte: now },
      createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      savedBy: { none: { userId } },
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, date: true, city: true, categoryId: true },
  });

  let created = 0;
  for (const event of recentEvents) {
    const existing = await prisma.notification.findFirst({
      where: { userId, eventId: event.id, type: 'recommendation' },
    });
    if (existing) continue;
    if (event.date && event.date < now) continue;

    await createNotification({
      userId,
      eventId: event.id,
      type: 'recommendation',
      title: `💡 Potrebbe interessarti: ${event.title}`,
      body: `Nuovo evento${event.city ? ` a ${event.city}` : ''} basato sulle tue preferenze.`,
    });
    created++;
  }

  return created;
}

export async function runDailyCheck(userId?: string) {
  const prisma = await getPrisma();

  const userIds = userId
    ? [userId]
    : (await prisma.savedEvent.findMany({ distinct: ['userId'], select: { userId: true } })).map((s) => s.userId);

  let totalReminders = 0;
  let totalRecs = 0;
  for (const uid of userIds) {
    totalReminders += await checkUpcomingEvents(uid);
    totalRecs += await checkRecommendations(uid);
  }

  return { reminders: totalReminders, recommendations: totalRecs, users: userIds.length };
}
