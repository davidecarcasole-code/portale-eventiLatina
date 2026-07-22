import type { Metadata } from "next";

const SITE_URL = "https://portale-eventi-latina.vercel.app";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

async function getEvent(slug: string) {
  try {
    const res = await fetch(`${SITE_URL}/api/events/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return {
      title: "Evento non trovato | EventiNLatina",
      description: "L'evento che cerchi non esiste o è stato rimosso.",
    };
  }

  const imageUrl = event.image_url || DEFAULT_IMAGE;
  const description = event.description?.slice(0, 160) || `Scopri ${event.title} su EventiNLatina`;
  const eventUrl = `${SITE_URL}/events/${event.slug || event.id}`;

  return {
    title: `${event.title} | EventiNLatina`,
    description,
    openGraph: {
      title: event.title,
      description,
      url: eventUrl,
      siteName: "EventiNLatina",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      locale: "it_IT",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: eventUrl,
    },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  let initialEvent = null;
  if (event) {
    initialEvent = {
      ...event,
      is_new: event.is_new ?? (Math.abs(Date.now() - new Date(event.createdAt).getTime()) / 86400000 <= 7),
    };
  }

  const EventDetailClient = (await import("./event-detail")).default;
  return <EventDetailClient initialEvent={initialEvent} slug={slug} />;
}
