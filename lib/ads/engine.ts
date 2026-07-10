async function getPrisma() {
  const mod = await import("@/lib/prisma");
  return mod.prisma;
}

export async function ensureAdsTable() {
  const prisma = await getPrisma();
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        image_url TEXT NOT NULL,
        link_url TEXT,
        placement TEXT NOT NULL DEFAULT 'sidebar',
        size TEXT NOT NULL DEFAULT 'square',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        click_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('[Ads] Ensured ads table');
  } catch (err) {
    console.error('[Ads] Failed to ensure ads table:', err);
  }
}

export async function listAds(placement?: string) {
  const prisma = await getPrisma();
  const where: any = { isActive: true };
  if (placement) where.placement = placement;
  if (!placement) {
    // admin view: all
    return prisma.ad.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  return prisma.ad.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
}

export async function listAllAds() {
  const prisma = await getPrisma();
  return prisma.ad.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createAd(data: {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  placement: string;
  size?: string;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
}) {
  const prisma = await getPrisma();
  return prisma.ad.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl || null,
      placement: data.placement,
      size: data.size || 'square',
      sortOrder: data.sortOrder || 0,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
}

export async function deleteAd(id: number) {
  const prisma = await getPrisma();
  return prisma.ad.delete({ where: { id } });
}
