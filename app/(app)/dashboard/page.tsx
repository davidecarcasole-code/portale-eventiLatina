"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Sparkles, MapPin, Clock, Music, Theater, Book, Trophy, Leaf, Mountain, Car, Wine, Rocket, ArrowRight, Plus, ChevronLeft, ChevronRight, ExternalLink, Mail, Film, Waves, Heart, CloudSun, PartyPopper } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const categoryIcons: Record<string, any> = {
  musica: Music, teatro: Theater, cultura: Book, sport: Trophy, natura: Leaf,
  trekking: Mountain, montagna: Mountain, gite: Car, spettacolo: Sparkles,
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
              className="snap-start flex-shrink-0 rounded-2xl p-5 flex flex-col items-center gap-3 min-w-[130px] transition-all duration-300 hover:-translate-y-1.5 border border-[var(--card-border)] bg-[var(--card-bg)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[var(--accent)] stagger-[i+1]">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:rotate-12 hover:scale-110" style={{ backgroundColor: cat.color + "15", color: cat.color }}>
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

  useEffect(() => {
    async function load() {
      try {
        const [eventsRes, todayRes] = await Promise.all([
          fetch("/api/events?page=1&limit=50&excludeCategory=bambini"),
          fetch(`/api/events?page=1&limit=50&dateFrom=${new Date().toISOString().split("T")[0]}&dateTo=${new Date().toISOString().split("T")[0]}&excludeCategory=bambini`),
        ]);
        const eventsData = await eventsRes.json();
        const todayData = await todayRes.json();
        setEvents(eventsData.events || []);
        setTodayEvents(todayData.events || []);

        const catMap = new Map<string, { name: string; slug: string; icon: string; color: string; count: number }>();
        for (const e of [...(eventsData.events || []), ...(todayData.events || [])]) {
          if (e.category_slug && e.category_slug !== "bambini") {
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

  const today = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buongiorno" : hour < 18 ? "Buon pomeriggio" : "Buonasera";

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Caricamento...</p>
      </div>
    </div>
  );

  return (
    <div className="page-container space-y-8 animate-fade-in relative">
      <div className="blur-sphere blur-sphere-1" />
      <div className="blur-sphere blur-sphere-2" />

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl group/banner">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e2a4a] via-[#1a1050] to-[#2d1050]" />
        <div className="absolute inset-0 bg-[url('/banner.png')] bg-cover bg-center opacity-[0.12] mix-blend-overlay" />

        {/* Glowing orbs */}
        <div className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/25 via-blue-500/15 to-transparent rounded-full blur-[160px] animate-blob" />
        <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-gradient-to-tl from-fuchsia-400/20 via-purple-500/15 to-transparent rounded-full blur-[160px] animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[30%] right-[25%] w-32 h-32 bg-cyan-300/15 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute bottom-[20%] left-[15%] w-28 h-28 bg-amber-300/10 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: "7s", animationDelay: "1s" }} />

        {/* Gradient border */}
        <div className="absolute inset-0 rounded-3xl p-[1px] pointer-events-none">
          <div className="w-full h-full rounded-3xl border border-white/[0.1]" />
        </div>

        {/* Content */}
        <div className="relative px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.1] border border-white/[0.12] backdrop-blur-sm mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                <span className="text-[11px] text-white/60 font-medium capitalize">{today}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-transparent">
                  {greeting}{user?.name ? `, ${user.name}` : ""}
                </span>
              </h1>

              <p className="text-white/50 mt-4 max-w-lg text-base sm:text-lg leading-relaxed">
                Eventi, sagre, concerti e manifestazioni in provincia di Latina e nel Lazio
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/events" className="group/btn inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300">
                  Esplora eventi
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                {canManageEvents && (
                  <Link href="/admin?new=1" className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-medium text-white/70 bg-white/[0.1] border border-white/[0.12] backdrop-blur-sm hover:bg-white/[0.15] hover:text-white hover:border-white/[0.2] transition-all duration-300">
                    <Plus size={16} /> Nuovo Evento
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Quick links */}
            <div className="flex-shrink-0 w-full lg:w-80 space-y-3">
              <QuickLink href="/andiamo-al-cinema" icon={Film} label="Cinema" gradient="from-amber-400 to-orange-500" />
              <QuickLink href="/tutti-al-mare" icon={Waves} label="Tutti al Mare" gradient="from-cyan-400 to-teal-500" />
              <QuickLink href="/spazio-kids" icon={Rocket} label="Spazio Kids" gradient="from-yellow-400 to-amber-500" />
              <QuickLink href="/spazio-venere" icon={Heart} label="Spazio Venere" gradient="from-pink-400 to-rose-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Oggi", value: todayEvents.length, icon: Calendar, gradient: "from-blue-500 to-indigo-500", bg: "bg-blue-500/10" },
          { label: "Prossimi", value: events.length, icon: TrendingUp, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10" },
          { label: "Categorie", value: categories.length, icon: Sparkles, gradient: "from-purple-500 to-pink-500", bg: "bg-purple-500/10" },
          { label: "Al Mare", value: categories.find((c: any) => c.slug === "mare")?.count || 0, icon: Waves, gradient: "from-cyan-500 to-blue-500", bg: "bg-cyan-500/10" },
        ].map((s, i) => (
          <div key={s.label} className={`rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/50 transition-all duration-300 stagger-${i + 1}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                <s.icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">{s.label}</p>
                <p className="text-2xl font-bold mt-0.5">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Categorie</h3>
            <Link href="/events" className="text-xs text-[var(--accent)] hover:underline font-medium">Vedi tutti</Link>
          </div>
          <CategoryCarousel categories={categories} />
        </div>
      )}

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-8">
          {/* Today's Events */}
          {todayEvents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <PartyPopper size={18} className="text-[var(--accent)]" />
                  Oggi a Latina
                  <span className="text-[10px] bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-2 py-0.5 rounded-full animate-pulse ml-1">Live</span>
                </h3>
                <span className="text-xs text-[var(--text-muted)]">{todayEvents.length} eventi</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todayEvents.slice(0, 6).map((e: any) => (
                  <Link key={e.id} href={`/events/${e.slug || e.id}`}
                    className="flex items-start gap-3 rounded-2xl p-4 border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 group">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: (e.category_color || "#94a3b8") + "15", color: e.category_color || "#94a3b8" }}>
                      {React.createElement(categoryIcons[e.category_slug] || Calendar, { size: 18 })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: (e.category_color || "#94a3b8") + "15", color: e.category_color || "#94a3b8" }}>{e.category_name}</span>
                      <h4 className="font-medium text-sm leading-snug line-clamp-2 mt-1 group-hover:text-[var(--accent)] transition-colors">{e.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)]">
                        {e.time && <span className="flex items-center gap-1"><Clock size={11} />{e.time}</span>}
                        {e.city && <span className="flex items-center gap-1"><MapPin size={11} />{e.city}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {events.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Calendar size={18} className="text-[var(--accent)]" />
                  Prossimi Eventi
                </h3>
                <Link href="/events" className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-medium">
                  Vedi tutti <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.slice(0, 8).map((e: any) => (
                  <Link key={e.id} href={`/events/${e.slug || e.id}`}
                    className="flex items-start gap-3 rounded-2xl p-4 border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 group">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: (e.category_color || "#94a3b8") + "15", color: e.category_color || "#94a3b8" }}>
                      {React.createElement(categoryIcons[e.category_slug] || Calendar, { size: 18 })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: (e.category_color || "#94a3b8") + "15", color: e.category_color || "#94a3b8" }}>{e.category_name}</span>
                      <h4 className="font-medium text-sm leading-snug line-clamp-2 mt-1 group-hover:text-[var(--accent)] transition-colors">{e.title}</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{new Date(e.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                        {e.time && <span className="flex items-center gap-1"><Clock size={11} />{e.time}</span>}
                        {e.city && <span className="flex items-center gap-1"><MapPin size={11} />{e.city}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex flex-col gap-4">
          <div className="sticky top-20 space-y-4">
            <VerticalAdColumn />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, gradient }: { href: string; icon: any; label: string; gradient: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 group">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={16} className="text-white" />
      </div>
      <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{label}</span>
      <ArrowRight size={14} className="ml-auto text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
    </Link>
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
          <div key={i} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] min-h-[200px] animate-pulse flex items-center justify-center">
            <span className="text-xs text-[var(--text-muted)]">Caricamento...</span>
          </div>
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--accent-subtle)]/20 p-4 flex flex-col items-center justify-center text-center gap-2 aspect-square">
        <Mail size={16} className="text-[var(--accent)]" />
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          Spazio pubblicitario<br />disponibile
        </p>
        <a href="mailto:info@eventinlatina.it" className="text-[9px] text-[var(--accent)] hover:underline font-medium">
          info@eventinlatina.it
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {ads.map((a: any) => (
        <a key={a.id}
          href={a.linkUrl || "#"}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={async () => { try { await fetch(`/api/ads/${a.id}/click`, { method: "POST" }); } catch {} }}
          className="relative group overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:shadow-[0_0_20px_var(--accent-glow)] block aspect-square"
        >
          <img
            src={a.imageUrl}
            alt={a.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-sm text-[8px] text-white/70 px-1 py-0.5 rounded font-medium uppercase tracking-wider">
            Ad
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-[9px] text-white/80 truncate font-medium">{a.title}</p>
          </div>
          {a.linkUrl && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                Apri <ExternalLink size={8} />
              </span>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
