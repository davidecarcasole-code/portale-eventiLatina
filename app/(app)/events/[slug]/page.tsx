import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evento | EventiNLatina",
};

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const EventDetailClient = (await import("./event-detail")).default;
  return <EventDetailClient initialEvent={null} slug={slug} />;
}
