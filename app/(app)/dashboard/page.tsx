"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Sparkles, MapPin, Clock, Music, Theater, Book, Trophy, Leaf, Mountain, Car, Sparkles as SparklesIcon, Wine, Baby, ArrowRight, Plus } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const categoryIcons: Record<string, any> = {
  musica: Music, teatro: Theater, cultura: Book, sport: Trophy, natura: Leaf,
  trekking: Mountain, montagna: Mountain, gite: Car, spettacolo: SparklesIcon,
  enogastronomia: Wine, bambini: Baby,
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [events, setEvents] = useState<any[]>([]);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eventsRes, todayRes] = await Promise.all([
          fetch("/api/events?page=1&limit=50"),
          fetch(`/api/events?page=1&limit=50&dateFrom=${new Date().toISOString().split("T")[0]}&dateTo=${new Date().toISOString().split("T")[0]}`),
        ]);
        const eventsData = await eventsRes.json();
        const todayData = await todayRes.json();
        setEvents(eventsData.events || []);
        setTodayEvents(todayData.events || []);

        const catMap = new Map<string, { name: string; slug: string; icon: string; color: string; count: number }>();
        for (const e of [...(eventsData.events || []), ...(todayData.events || [])]) {
          if (e.category_slug) {
            if (!catMap.has(e.category_slug)) {
              catMap.set(e.category_slug, { name: e.category_name, slug: e.category_slug, icon: e.category_icon, color: e.category_color, count: 0 });
            }
            catMap.get(e.category_slug)!.count++;
          }
        }
        setCategories(Array.from(catMap.values()));
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Caricamento...</p>
      </div>
    </div>
  );

  return (
    <div className="page-container space-y-6 animate-fade-in relative">
      <div className="blur-sphere blur-sphere-1" />
      <div className="blur-sphere blur-sphere-2" />
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-indigo-500 p-6 sm:p-8 text-white animate-fire-pulse">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-4 left-10 w-3 h-3 bg-cyan-300 rounded-full animate-float-up" style={{ animationDelay: "0s" }} />
        <div className="absolute top-8 right-20 w-2.5 h-2.5 bg-white/40 rounded animate-float-up" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-3 right-40 w-2 h-2 bg-pink-300 rounded animate-float-up" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-12 left-[30%] w-3 h-3 bg-cyan-200 rounded animate-float-up" style={{ animationDelay: "0.8s" }} />
        <div className="absolute top-16 left-[60%] w-2 h-2 bg-white/60 rotate-45 animate-float-up" style={{ animationDelay: "1.3s" }} />
        <div className="absolute bottom-6 right-[25%] w-2.5 h-2.5 bg-indigo-200 rounded-full animate-float-up" style={{ animationDelay: "0.3s" }} />
        <div className="relative">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider">{today}</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 flex items-center gap-2">
            Benvenuto su EventiNLatina
            <Sparkles size={22} className="text-cyan-200" />
          </h2>
          <p className="text-white/80 mt-1.5 max-w-lg">Scopri tutti gli eventi, sagre, concerti e manifestazioni in provincia di Latina e nel Lazio</p>
          <div className="flex gap-2 mt-4">
            <Link href="/events" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium text-white hover:bg-white/30 transition-all hover:scale-105 active:scale-95">
              Esplora eventi <ArrowRight size={14} />
            </Link>
            {isAdmin && (
              <Link href="/admin" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/90 text-teal-700 rounded-xl text-sm font-medium hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-lg">
                <Plus size={14} /> Nuovo Evento
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Eventi Oggi", value: todayEvents.length, icon: Calendar, color: "from-blue-500 to-blue-600" },
          { label: "Prossimi Eventi", value: events.length, icon: TrendingUp, color: "from-green-500 to-green-600" },
          { label: "Categorie", value: categories.length, icon: Sparkles, color: "from-purple-500 to-purple-600" },
        ].map((s, i) => (
          <div key={s.label} className={`glass-card rounded-xl p-5 stagger-${i + 1} group hover:shadow-[0_0_25px_var(--accent-glow)] transition-all duration-300`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <s.icon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">{s.label}</p>
                <p className="text-2xl font-bold mt-0.5">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Categorie</h3>
            <Link href="/events" className="text-xs text-[var(--accent)] hover:underline font-medium">Vedi tutti</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto py-3 scrollbar-thin">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[cat.slug] || Calendar;
              return (
                <Link key={cat.slug} href={`/events?category=${cat.slug}`}
                  className={`flex-shrink-0 glass-card rounded-xl p-5 flex flex-col items-center gap-3 min-w-[110px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_var(--accent-glow)] stagger-${i + 1}`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:rotate-12 hover:scale-110" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-semibold text-center">{cat.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{cat.count} eventi</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {todayEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Eventi di Oggi
              <span className="text-xs bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-2 py-0.5 rounded-full animate-pulse">Live</span>
            </h3>
            <span className="text-xs text-[var(--text-muted)]">{todayEvents.length} eventi</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {todayEvents.slice(0, 6).map((e: any) => (
              <Link key={e.id} href={`/events/${e.id}`} className="glass-card rounded-xl p-4 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" style={{ backgroundColor: e.category_color + "20", color: e.category_color }}>
                    {React.createElement(categoryIcons[e.category_slug] || Calendar, { size: 18 })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: e.category_color + "20", color: e.category_color }}>{e.category_name}</span>
                    </div>
                    <h4 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{e.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)]">
                      {e.time && <span className="flex items-center gap-1"><Clock size={11} />{e.time}</span>}
                      {e.city && <span className="flex items-center gap-1"><MapPin size={11} />{e.city}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Prossimi Eventi</h3>
            <Link href="/events" className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-medium">
              Vedi tutti <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.slice(0, 9).map((e: any) => (
              <Link key={e.id} href={`/events/${e.id}`} className="glass-card rounded-xl p-4 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300" style={{ backgroundColor: e.category_color + "20", color: e.category_color }}>
                    {React.createElement(categoryIcons[e.category_slug] || Calendar, { size: 18 })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: e.category_color + "20", color: e.category_color }}>{e.category_name}</span>
                    </div>
                    <h4 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{e.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{new Date(e.date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                      {e.time && <span className="flex items-center gap-1"><Clock size={11} />{e.time}</span>}
                      {e.city && <span className="flex items-center gap-1"><MapPin size={11} />{e.city}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
