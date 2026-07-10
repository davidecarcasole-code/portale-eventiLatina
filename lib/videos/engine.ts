async function getPrisma() {
  const mod = await import("@/lib/prisma");
  return mod.prisma;
}

export async function ensureVideosTable() {
  const prisma = await getPrisma();
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        embed_url TEXT NOT NULL,
        thumbnail TEXT,
        platform TEXT NOT NULL DEFAULT 'youtube',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('[Video] Ensured videos table');
  } catch (err) {
    console.error('[Video] Failed to ensure videos table:', err);
  }
}

export function parseEmbedUrl(url: string): { platform: string; embedSrc: string } {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { platform: 'youtube', embedSrc: `https://www.youtube.com/embed/${ytMatch[1]}` };

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { platform: 'vimeo', embedSrc: `https://player.vimeo.com/video/${vimeoMatch[1]}` };

  // Instagram
  const igMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) return { platform: 'instagram', embedSrc: `https://www.instagram.com/p/${igMatch[1]}/embed` };

  // Facebook video
  const fbMatch = url.match(/facebook\.com\/(?:[^/]+\/)?videos\/(\d+)/);
  if (fbMatch) return { platform: 'facebook', embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}` };

  // TikTok
  const ttMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (ttMatch) return { platform: 'tiktok', embedSrc: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` };

  // Generic — treat as iframe src directly
  return { platform: 'other', embedSrc: url };
}

export async function listVideos() {
  const prisma = await getPrisma();
  return prisma.video.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function listAllVideos() {
  const prisma = await getPrisma();
  return prisma.video.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createVideo(data: {
  title: string;
  description?: string;
  embedUrl: string;
  thumbnail?: string;
  platform?: string;
  sortOrder?: number;
}) {
  const prisma = await getPrisma();
  const parsed = parseEmbedUrl(data.embedUrl);
  return prisma.video.create({
    data: {
      title: data.title,
      description: data.description || null,
      embedUrl: parsed.embedSrc,
      thumbnail: data.thumbnail || null,
      platform: data.platform || parsed.platform,
      sortOrder: data.sortOrder || 0,
    },
  });
}

export async function deleteVideo(id: number) {
  const prisma = await getPrisma();
  return prisma.video.delete({ where: { id } });
}
