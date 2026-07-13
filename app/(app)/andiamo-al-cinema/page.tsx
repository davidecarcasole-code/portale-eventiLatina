"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Film, Sparkles, MapPin, Clock, Calendar, MapPin as MapPinIcon, Clock as ClockIcon } from "lucide-react";

const SUBCATEGORIES = [
  { slug: "cinema", label: "Cinema", icon: Film, color: "#8b5cf6", desc: "Proiezioni e rassegne cinematografiche" },
  { slug: "rassegna", label: "Rassegne", icon: Sparkles, color: "#f43f5e", desc: "Festival e rassegne tematiche" },
  { slug: "allaperto", label: "Cinema all'aperto", icon: Film, color: "#22c55e", desc: "Proiezioni sotto le stelle" },
];

export default function CinemaPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        params.set("category", "cinema");
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

  return (
    <div className="animate-fade-in">
      <div className="relative mb-8 overflow-hidden rounded-3xl -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800" />
        <div className="absolute inset-0 bg-[url('/banner.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-indigo-500/20 to-transparent" />
        <div className="absolute top-6 right-12 w-3 h-3 rounded-full bg-purple-300/40 animate-float-up" style={{ animationDelay: "0.2s" }} />
        <div className="absolute top-10 left-1/4 w-2 h-2 rounded-full bg-indigo-300/40 animate-float-up" style={{ animationDelay: "0.7s" }} />
        <div className="absolute bottom-12 right-1/3 w-4 h-4 rounded-full bg-purple-300/30 animate-float-up" style={{ animationDelay: "1.2s" }} />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <Film size={28} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-purple-200 text-sm font-medium uppercase tracking-widest">Sezione</p>
              <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">Andiamo al Cinema</h1>
            </div>
          </div>
          <p className="text-white/90 max-w-xl text-sm sm:text-base leading-relaxed">
            Scopri tutte le proiezioni, rassegne e cinema all'aperto in provincia di Latina. Film d'autore, blockbuster, classici restaurati e anteprime.
          </p>
          <div className="flex gap-2 mt-6 flex-wrap">
            {SUBCATEGORIES.map((s) => (
              <button key={s.slug} onClick={() => setFilter(s.slug === filter ? "" : s.slug)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filter === s.slug
                    ? "bg-white text-purple-600 shadow-xl scale-105"
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
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Caricamento proiezioni...</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
            <Film size={28} className="text-purple-500" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)]">Nessuna proiezione trovata</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Prova a cambiare filtro o cerca altro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e: any) => (
            <Link key={e.id} href={`/events/${e.id}`} className="glass-card rounded-2xl p-4 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-300 group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  <Film size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "#8b5cf620", color: "#8b5cf6" }}>
                      {e.category_name || "Cinema"}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-purple-500 transition-colors">{e.title}</h4>
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