"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Waves, MapPin, Clock, Calendar, Umbrella, Sun, Anchor, MapPin as MapPinIcon, Clock as ClockIcon, Calendar as CalendarIcon } from "lucide-react";

const SUBCATEGORIES = [
  { slug: "spiaggia", label: "Spiaggia", icon: Umbrella, color: "#f97316", desc: "Eventi su spiagge e lidi" },
  { slug: "porto", label: "Porto e Marina", icon: Anchor, color: "#0ea5e9", desc: "Eventi nei porti e marine" },
  { slug: "costiera", label: "Costiera", icon: Waves, color: "#06b6d4", desc: "Eventi lungo la costa" },
];

export default function MarePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        params.set("category", "mare");
        params.set("limit", "50");
        if (filter) params.set("search", filter);
        const res = await fetch(`/api/events?${params}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, [filter]);

  const slugs = filter || "spiaggia";

  return (
    <div className="page-container animate-fade-in">
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-amber-700" />
        <div className="absolute inset-0 bg-[url('/banner.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-amber-500/20 to-transparent" />
        <div className="absolute top-6 right-12 w-3 h-3 rounded-full bg-amber-300/40 animate-float-up" style={{ animationDelay: "0.2s" }} />
        <div className="absolute top-10 left-1/4 w-2 h-2 rounded-full bg-orange-300/40 animate-float-up" style={{ animationDelay: "0.7s" }} />
        <div className="absolute bottom-12 right-1/3 w-4 h-4 rounded-full bg-amber-300/30 animate-float-up" style={{ animationDelay: "1.2s" }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <Waves size={28} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-amber-200 text-sm font-medium uppercase tracking-widest">Sezione</p>
              <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">Tutti al Mare</h1>
            </div>
          </div>
          <p className="text-white/90 max-w-xl text-sm sm:text-base leading-relaxed">
            Scopri tutti gli eventi in riva al mare: concerti in spiaggia, aperitivi al tramonto, sport acquatici e festival costieri in provincia di Latina.
          </p>
          <div className="flex gap-2 mt-6 flex-wrap">
            {SUBCATEGORIES.map((s) => (
              <button key={s.slug} onClick={() => setFilter(s.slug === slugs ? "" : s.slug)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  slugs === s.slug
                    ? "bg-white text-orange-600 shadow-xl scale-105"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}>
                <s.icon size={16} style={{ color: s.color }} fill={s.color} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Caricamento eventi...</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <Waves size={28} className="text-amber-500" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)]">Nessun evento in mare</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Prova a cambiare filtro o cerca altro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e: any) => (
            <Link key={e.id} href={`/events/${e.id}`} className="glass-card rounded-2xl p-4 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300 group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  <Waves size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "#f9731620", color: "#f97316" }}>
                      {e.category_name || "Mare"}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">{e.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{new Date(e.date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                    {e.time && <span className="flex items-center gap-1"><ClockIcon size={11} />{e.time}</span>}
                    {e.city && <span className="flex items-center gap-1"><MapPinIcon size={11} />{e.city}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}