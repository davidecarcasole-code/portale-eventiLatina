export function generateIcs(event: {
  title: string;
  description?: string | null;
  date: string | Date;
  endDate?: string | Date | null;
  time?: string | null;
  location?: string | null;
  city?: string | null;
  address?: string | null;
  slug?: string | null;
  id?: number | null;
}): string {
  const formatDt = (d: Date): string =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const start = new Date(event.date);
  if (event.time) {
    const [h, m] = event.time.split(":").map(Number);
    if (!isNaN(h)) start.setHours(h, m || 0, 0, 0);
  }
  let end: Date;
  if (event.endDate) {
    end = new Date(event.endDate);
  } else {
    end = new Date(start);
    end.setHours(end.getHours() + 2);
  }

  const location = [event.location, event.city, event.address]
    .filter(Boolean)
    .join(", ");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EventiNLatina//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id || event.slug || "event"}@eventinlatina.vercel.app`,
    `DTSTART:${formatDt(start)}`,
    `DTEND:${formatDt(end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}`,
    location ? `LOCATION:${location}` : "",
    `URL:https://eventinlatina.vercel.app/events/${event.slug || event.id}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return lines;
}

export function googleCalendarUrl(event: {
  title: string;
  description?: string | null;
  date: string | Date;
  time?: string | null;
  location?: string | null;
  city?: string | null;
  slug?: string | null;
  id?: number | null;
}): string {
  const start = new Date(event.date);
  if (event.time) {
    const [h, m] = event.time.split(":").map(Number);
    if (!isNaN(h)) start.setHours(h, m || 0, 0, 0);
  }
  const end = new Date(start);
  end.setHours(end.getHours() + 2);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const location = [event.location, event.city].filter(Boolean).join(", ");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: event.description?.slice(0, 500) || "",
    location,
    ctz: "Europe/Rome",
    sf: "true",
    output: "xml",
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}
