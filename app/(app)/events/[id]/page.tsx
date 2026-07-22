"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EventIdRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.slug) {
          router.replace(`/events/${data.slug}`);
        } else {
          router.replace("/events");
        }
      })
      .catch(() => router.replace("/events"));
  }, [id, router]);

  return (
    <div className="flex justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Reindirizzamento...</p>
      </div>
    </div>
  );
}
