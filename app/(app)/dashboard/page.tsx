"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Sparkles, MapPin, Clock, Music, Theater, Book, Trophy, Leaf, Mountain, Car, Sparkles as SparklesIcon, Wine, Rocket, ArrowRight, Plus, ChevronLeft, ChevronRight, ExternalLink, Mail, Film, Waves, Heart, CloudSun } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const categoryIcons: Record<string, any> = {
  musica: Music, teatro: Theater, cultura: Book, sport: Trophy, natura: Leaf,
  trekking: Mountain, montagna: Mountain, gite: Car, spettacolo: SparklesIcon,
  enogastronomia: Wine, bambini: Rocket, cinema: Film, mare: Waves,
};

function CategoryCarousel({ categories }: { categories: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      <button onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-xl bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] opacity-0 group-hover/carousel:opacity-100 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-all shadow-lg -translate-x-1/2">
        <ChevronLeft size={18} />
      </button>
      <div ref={scrollRef}
        className="flex gap-3 overflow-x-auto py-3 scrollbar-none snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map((cat, i) => {
          const Icon = categoryIcons[cat.slug] || Calendar;
          return (
            <Link key={cat.slug} href={`/events?category=${cat.slug}`}
              className={`snap-start flex-shrink-0 glass-card rounded-xl p-5 flex flex-col items-center gap-3 min-w-[140px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_var(--accent-glow)] stagger-${i + 1}`}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:rotate-12 hover:scale-110" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                <Icon size={24} />
              </div>
              <span className="text-xs font-semibold text-center">{cat.name}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{cat.count} eventi</span>
            </Link>
          );
        })}
      </div>
      <button onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-xl bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] opacity-0 group-hover/carousel:opacity-100 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-all shadow-lg translate-x-1/2">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isPublisher = user?.role === "publisher";
  const canManageEvents = isAdmin || isPublisher;
  const [events, setEvents] = useState<any[]>([]);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerVariant, setBannerVariant] = useState(0);

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
      
      {/* Banner Variant Selector */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium mr-1">Banner:</span>
        {[
          { icon: Sparkles, label: "Dark Neon" },
          { icon: CloudSun, label: "Vetro" },
        ].map((v, i) => (
          <button key={i} onClick={() => setBannerVariant(i)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${bannerVariant === i ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"}`}>
            <v.icon size={12} /> {v.label}
          </button>
        ))}
      </div>

      {/* Variant 0: Dark Neon — premium redesign */}
      {bannerVariant === 0 && (
        <div className="relative overflow-hidden rounded-2xl mb-8 group/banner">
          {/* Deep space bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2e] to-[#1a0a2e]" />
          <div className="absolute inset-0 bg-[url('/banner.png')] bg-cover bg-center opacity-[0.07] mix-blend-overlay" />

          {/* Core glow — large vibrant orb */}
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/25 via-purple-500/15 to-transparent rounded-full blur-[250px] animate-blob" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-500/20 via-fuchsia-500/10 to-transparent rounded-full blur-[250px] animate-blob" style={{ animationDelay: "3s" }} />

          {/* Smaller accent orbs */}
          <div className="absolute top-1/4 right-[15%] w-32 h-32 bg-cyan-400/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute bottom-1/3 left-[10%] w-40 h-40 bg-fuchsia-400/12 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />

          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[1px] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-br from-indigo-500/40 via-cyan-400/20 to-fuchsia-500/40" />
          </div>

          {/* Floating glowing particles */}
          <div className="absolute inset-0 opacity-50" style={{ pointerEvents: 'none' }}>
            <div className="absolute top-8 left-[12%] w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_12px_3px_#22d3ee] animate-float-up" style={{ animationDuration: "7s" }} />
            <div className="absolute top-16 right-[20%] w-1 h-1 bg-fuchsia-300 rounded-full shadow-[0_0_10px_2px_#d946ef] animate-float-up" style={{ animationDuration: "6s", animationDelay: "1s" }} />
            <div className="absolute bottom-12 left-[30%] w-1 h-1 bg-indigo-300 rounded-full shadow-[0_0_10px_2px_#818cf8] animate-float-up" style={{ animationDuration: "8s", animationDelay: "0.5s" }} />
            <div className="absolute top-1/3 right-[40%] w-2 h-2 bg-cyan-200/60 rounded-full shadow-[0_0_14px_3px_#67e8f9] animate-float-up" style={{ animationDuration: "9s", animationDelay: "2s" }} />
            <div className="absolute bottom-20 right-[25%] w-1 h-1 bg-fuchsia-200/60 rounded-full shadow-[0_0_10px_2px_#f0abfc] animate-float-up" style={{ animationDuration: "7s", animationDelay: "3s" }} />
          </div>

          {/* Content */}
          <div className="relative p-8 sm:p-10 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left: greeting */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                  <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">{today}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                    Benvenuto{user?.name ? `, ${user.name}` : ""}
                  </span>
                </h1>
                <p className="text-white/50 mt-3 max-w-xl text-sm sm:text-base leading-relaxed">
                  Scopri tutti gli eventi, sagre, concerti e manifestazioni in provincia di Latina e nel Lazio
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link href="/events" className="group/btn inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300">
                    Esplora eventi
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  {canManageEvents && (
                    <Link href="/admin?new=1" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                      <Plus size={16} /> Nuovo Evento
                    </Link>
                  )}
                  <Link href="/andiamo-al-cinema" className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-white/70 bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all duration-300">
                    <Film size={14} /> Cinema
                  </Link>
                  <Link href="/tutti-al-mare" className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-white/70 bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all duration-300">
                    <Waves size={14} /> Mare
                  </Link>
                  <Link href="/spazio-kids" className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-white/70 bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all duration-300">
                    <Rocket size={14} /> Kid's
                  </Link>
                  <Link href="/spazio-venere" className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-white/70 bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all duration-300">
                    <Heart size={14} /> Venere
                  </Link>
                </div>
              </div>

              {/* Right: next event glass card */}
              <div className="flex-shrink-0 w-full lg:w-72">
                <div className="rounded-2xl p-5 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                      <Calendar size={24} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Prossimo evento</p>
                      <p className="text-sm font-semibold text-white/90 mt-1 line-clamp-2 leading-snug">
                        {todayEvents.length > 0 ? todayEvents[0].title : "Nessun evento oggi"}
                      </p>
                      {todayEvents.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-white/40 flex items-center gap-1">
                            <Clock size={10} /> {todayEvents[0].time || "Tutto il giorno"}
                          </span>
                          {todayEvents[0].city && (
                            <span className="text-[10px] text-white/40 flex items-center gap-1">
                              <MapPin size={10} /> {todayEvents[0].city}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <span className="text-[10px] text-indigo-300/60 font-medium">{todayEvents.length} evento{todayEvents.length !== 1 ? "i" : ""} oggi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variant 1: Glassmorphism / Vetro */}
      {bannerVariant === 1 && (
        <div className="relative overflow-hidden rounded-2xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-indigo-950" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2YjcyODEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-[150px]" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-[150px]" />
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-indigo-500 dark:text-indigo-300 text-sm font-medium uppercase tracking-wider">{today}</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
                  Benvenuto{user?.name ? `, ${user.name}` : ""}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-2xl text-base sm:text-lg leading-relaxed">
                  Scopri tutti gli eventi, sagre, concerti e manifestazioni in provincia di Latina e nel Lazio
                </p>
              </div>
              <NextEventBadge todayEvents={todayEvents} />
            </div>
            <BannerButtons canManageEvents={canManageEvents} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Eventi Oggi", value: todayEvents.length, icon: Calendar, color: "from-blue-500 to-blue-600" },
          { label: "Prossimi Eventi", value: events.length, icon: TrendingUp, color: "from-green-500 to-green-600" },
          { label: "Categorie", value: categories.length, icon: Sparkles, color: "from-purple-500 to-purple-600" },
        ].map((s, i) => (
          <div key={s.label} className={`glass-card rounded-xl p-5 stagger-${i + 1} transition-all duration-300`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <s.icon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">{s.label}</p>
                <p className="text-2xl font-bold mt-0.5">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Categorie</h3>
            <Link href="/events" className="text-xs text-[var(--accent)] hover:underline font-medium">Vedi tutti</Link>
          </div>
          <CategoryCarousel categories={categories} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {todayEvents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  Eventi di Oggi
                  <span className="text-xs bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-2 py-0.5 rounded-full animate-pulse">Live</span>
                </h3>
                <span className="text-xs text-[var(--text-muted)]">{todayEvents.length} eventi</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Prossimi Eventi</h3>
                <Link href="/events" className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-medium">
                  Vedi tutti <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="hidden lg:flex flex-col gap-4">
          <div className="sticky top-20 space-y-4">
            <VerticalAdColumn />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hero Banner Sub‑Components ── */

function NextEventBadge({ todayEvents, light }: { todayEvents: any[]; light?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${light ? "bg-white/10 border-white/10 backdrop-blur-sm" : "glass-card"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${light ? "from-amber-400 to-orange-500" : "from-cyan-500 to-indigo-600"} flex items-center justify-center shadow-lg`}>
          <Calendar size={22} className="text-white" />
        </div>
        <div className="text-right">
          <p className={`text-[11px] uppercase tracking-wider ${light ? "text-amber-100" : "text-white/60"}`}>Prossimo evento</p>
          <p className={`text-sm font-semibold truncate max-w-xs ${light ? "text-white" : "text-white"}`}>
            {todayEvents.length > 0 ? todayEvents[0].title : "Nessun evento oggi"}
          </p>
          {todayEvents.length > 0 && (
            <p className={`text-[11px] flex items-center gap-1 mt-0.5 ${light ? "text-amber-100/70" : "text-white/50"}`}>
              <Clock size={10} />
              {todayEvents[0].time || "Tutto il giorno"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BannerButtons({ canManageEvents }: { canManageEvents: boolean }) {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <Link href="/events" className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 active:scale-95">
        <span className="relative z-10">Esplora eventi</span>
        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
      </Link>
      {canManageEvents && (
        <Link href="/admin?new=1" className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 hover:from-fuchsia-400 hover:to-purple-500 hover:shadow-fuchsia-500/40 transition-all duration-300 hover:scale-105 active:scale-95">
          <Plus size={16} />
          <span className="relative z-10">Nuovo Evento</span>
        </Link>
      )}
      <Link href="/andiamo-al-cinema" className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-700 shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:to-indigo-600 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
        <Film size={16} />
        <span className="relative z-10">Andiamo al Cinema</span>
      </Link>
      <Link href="/tutti-al-mare" className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-teal-500 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
        <Waves size={16} />
        <span className="relative z-10">Tutti al Mare</span>
      </Link>
      <Link href="/spazio-kids" className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-amber-500 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
        <Rocket size={16} />
        <span className="relative z-10">Kid's</span>
      </Link>
      <Link href="/spazio-venere" className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30 hover:from-pink-400 hover:to-rose-500 hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
        <Heart size={16} />
        <span className="relative z-10">Venere</span>
      </Link>
    </div>
  );
}

/* ── Sidebar Ads ── */

function VerticalAdColumn() {
  const [ads, setAds] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/ads?placement=sidebar")
      .then(r => r.json())
      .then(d => { setAds(d.ads || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] min-h-[200px] animate-pulse flex items-center justify-center">
            <span className="text-xs text-[var(--text-muted)]">Caricamento...</span>
          </div>
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--accent-subtle)]/30 p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[200px]">
        <Mail size={24} className="text-[var(--text-muted)]" />
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Contattaci per avere<br />il tuo spazio pubblicitario qui
        </p>
        <a href="mailto:info@eventinlatina.it" className="text-[10px] text-[var(--accent)] hover:underline font-medium">
          info@eventinlatina.it
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ads.map((a: any) => (
        <a key={a.id}
          href={a.linkUrl || "#"}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={async () => { try { await fetch(`/api/ads/${a.id}/click`, { method: "POST" }); } catch {} }}
          className="relative group overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:shadow-[0_0_20px_var(--accent-glow)] block"
        >
          <div className="relative min-h-[200px]">
            <img
              src={a.imageUrl}
              alt={a.title}
              className="w-full h-full absolute inset-0 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-sm text-[9px] text-white/70 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
              Ad
            </div>
            {a.linkUrl && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                  Apri <ExternalLink size={10} />
                </span>
              </div>
            )}
          </div>
          <div className="px-3 py-1.5 border-t border-[var(--card-border)]">
            <p className="text-[10px] text-[var(--text-muted)] truncate">{a.title}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
