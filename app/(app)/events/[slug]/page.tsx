import type { Metadata } from "next";

function repairSurrogates(s: string): string {
  return s
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "\uFFFD")
    .replace(/(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "$1\uFFFD");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { prisma } = await import("@/lib/prisma");
    const event = await prisma.event.findFirst({
      where: { slug },
      include: { category: true },
    });
    if (event) {
      const baseUrl = "https://eventinlatina.vercel.app";
      return {
        title: `${event.title} | EventiNLatina`,
        description: repairSurrogates((event.description || `Evento a ${event.city || "Latina"}`).slice(0, 160)),
        openGraph: {
          title: event.title,
          description: repairSurrogates((event.description || "").slice(0, 200)),
          type: "article",
          url: `${baseUrl}/events/${slug}`,
          images: event.imageUrl ? [{ url: event.imageUrl, width: 1200, height: 630 }] : [],
          siteName: "EventiNLatina",
          locale: "it_IT",
        },
        twitter: {
          card: "summary_large_image",
          title: event.title,
          description: repairSurrogates((event.description || "").slice(0, 200)),
          images: event.imageUrl ? [event.imageUrl] : [],
        },
      };
    }
  } catch {}
  return { title: "Evento | EventiNLatina" };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let jsonLd = "";
  try {
    const { prisma } = await import("@/lib/prisma");
    const event = await prisma.event.findFirst({
      where: { slug },
      include: { category: true },
    });
    if (event) {
      jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Event",
        name: repairSurrogates(event.title),
        description: repairSurrogates((event.description || "").slice(0, 500)),
        startDate: event.date?.toISOString().split("T")[0],
        endDate: event.endDate?.toISOString().split("T")[0],
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: repairSurrogates(event.location || event.city || "Latina"),
          address: {
            "@type": "PostalAddress",
            addressLocality: repairSurrogates(event.city || "Latina"),
            addressRegion: event.province || "LT",
            addressCountry: "IT",
          },
        },
        image: event.imageUrl,
        url: `https://eventinlatina.vercel.app/events/${slug}`,
      });
    }
  } catch {}

  const EventDetailClient = (await import("./event-detail")).default;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
      <EventDetailClient initialEvent={null} slug={slug} />
    </>
  );
}
