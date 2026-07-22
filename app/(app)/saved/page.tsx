"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Calendar, MapPin, Clock, Trash2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function SavedEventsPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!user) router.push("/login"); }, [user]);

  useEffect(() => {
    fetch("/api/events/saved/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, token]);

  async function unsave(eventId: number) {
    await fetch(`/api/events/${eventId}/save`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setEvents(events.filter((e) => e.id !== eventId));
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold flex items-center gap-2"><Bookmark size={20} className="text-[var(--accent)]" /> Eventi Salvati</h1>
      {events.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <Bookmark size={48} className="mx-auto mb-3 opacity-30" />
          <p>Nessun evento salvato</p>
          <Link href="/events" className="text-sm text-[var(--accent)] hover:underline mt-2 inline-block">Scopri eventi</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((e: any) => (
            <div key={e.id} className="gradient-card rounded-xl p-4 group">
              <Link href={`/events/${e.slug || e.id}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (e.category_color || "#0891b2") + "20", color: e.category_color || "#0891b2" }}>
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm truncate">{e.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{new Date(e.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                      {e.time && <span className="flex items-center gap-1"><Clock size={12} />{e.time}</span>}
                      {e.city && <span className="flex items-center gap-1"><MapPin size={12} />{e.city}</span>}
                    </div>
                  </div>
                </div>
              </Link>
              <button onClick={() => unsave(e.id)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
