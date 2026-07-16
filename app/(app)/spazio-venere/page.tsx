"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Activity, Flower2, MapPin, Clock, Calendar } from "lucide-react";

const SUBCATEGORIES = [
  { slug: "salute", label: "Salute", icon: Activity, color: "#3b82f6" },
  { slug: "benessere", label: "Benessere", icon: Heart, color: "#10b981" },
  { slug: "rosa", label: "Eventi in Rosa", icon: Flower2, color: "#ec4899" },
];

const SECTION_COLORS = { bg: "from-pink-500 via-rose-500 to-purple-600", accent: "pink", accentHex: "#ec4899" };

export default function SpazioVenerePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const slugs = filter || "salute,benessere,rosa";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/events?limit=50&page=1&category=${slugs}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, [slugs]);

  const activeSub = SUBCATEGORIES.find(s => s.slug === filter);

  return (
    <div className="min-h-screen animate-fade-in">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl mb-8">
        <div className="absolute inset-0 bg-[url('/bannerspaziovenere.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/60 via-rose-900/50 to-purple-900/60" />
        <div className="relative p-8 sm:p-12 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <Heart size={28} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-pink-200 text-sm font-medium uppercase tracking-widest">Spazio</p>
              <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">Venere</h1>
            </div>
          </div>
          <p className="text-pink-100/90 max-w-xl text-sm sm:text-base leading-relaxed">
            Salute, benessere ed eventi al femminile. Un angolo dedicato alla cura di sé, alla prevenzione e alle iniziative in rosa nella provincia di Latina.
          </p>
          <div className="flex gap-2 mt-6 flex-wrap">
            {SUBCATEGORIES.map((s) => {
              const Icon = s.icon;
              const active = filter === s.slug;
              return (
                <button key={s.slug} onClick={() => setFilter(active ? "" : s.slug)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${active ? "bg-white text-pink-600 shadow-xl scale-105" : "bg-white/15 text-white hover:bg-white/25"}`}>
                  <Icon size={16} /> {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subcategory cards */}
      {!filter && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {SUBCATEGORIES.map((s) => {
            const Icon = s.icon;
            const count = events.filter((e: any) => e.category_slug === s.slug).length;
            return (
              <button key={s.slug} onClick={() => setFilter(s.slug)}
                className="group glass-card rounded-2xl p-6 text-left hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: s.color + "20", color: s.color }}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{s.label}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  {s.slug === "salute" && "Prevenzione e informazione sanitaria"}
                  {s.slug === "benessere" && "Relax, yoga e cura di sé"}
                  {s.slug === "rosa" && "Iniziative al femminile"}
                </p>
                <span className="text-xs font-medium" style={{ color: s.color }}>{count} eventi</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active filter header */}
      {filter && activeSub && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <activeSub.icon size={18} style={{ color: activeSub.color }} />
            <h2 className="text-lg font-semibold">{activeSub.label}</h2>
            <span className="text-xs text-[var(--text-muted)]">({events.length} eventi)</span>
          </div>
          <button onClick={() => setFilter("")} className="text-xs text-pink-500 hover:underline font-medium">Tutti gli spazi</button>
        </div>
      )}

      {/* Events */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Caricamento...</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-pink-400" />
          </div>
          <p className="text-lg font-medium">Nessun evento in questa sezione</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Torna presto a trovarci</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((e: any) => (
            <Link key={e.id} href={`/events/${e.id}`}
              className="glass-card rounded-2xl overflow-hidden group hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="px-5 pt-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: (e.category_color || SECTION_COLORS.accentHex) + "20", color: e.category_color || SECTION_COLORS.accentHex }}>
                    {e.category_name}
                  </span>
                  {e.is_new && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600">Nuovo</span>}
                </div>
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-pink-500 transition-colors">{e.title}</h3>
                {e.description && <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">{e.description}</p>}
              </div>
              <div className="px-5 pb-5 pt-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar size={12} />{new Date(e.date).toLocaleDateString("it-IT")}</span>
                  {e.time && <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock size={12} />{e.time}</span>}
                  {e.city && <span className="flex items-center gap-1.5 whitespace-nowrap"><MapPin size={12} />{e.city}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
