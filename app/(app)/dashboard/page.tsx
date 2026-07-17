"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Sparkles, MapPin, Clock, Music, Theater, Book, Trophy, Leaf, Mountain, Car, Sparkles as SparklesIcon, Wine, Rocket, ArrowRight, Plus, ChevronLeft, ChevronRight, ExternalLink, Mail, Film, Waves, Heart } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { AdBanner } from "@/components/AdBanner";

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
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900" />
        <div className="absolute inset-0 bg-[url('/banner.png')] bg-cover bg-center opacity-5" />
        
        {/* Animated mesh gradients */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 rounded-full blur-[200px] animate-blob" style={{ animationDuration: "8s", animationDelay: "0s" }} />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tr from-fuchsia-500/20 via-transparent to-lime-500/20 rounded-full blur-[200px] animate-blob" style={{ animationDuration: "10s", animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-indigo-500/15 via-transparent to-cyan-500/15 rounded-full blur-[150px] animate-blob" style={{ animationDuration: "12s", animationDelay: "4s" }} />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 opacity-60" style={{ pointerEvents: 'none' }}>
          <div className="absolute top-4 left-[8%] w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_2px_#22d3ee] animate-float-up" style={{ animationDelay: "0s", animationDuration: "6s" }} />
          <div className="absolute top-12 right-[12%] w-1 h-1 bg-fuchsia-400 rounded-full shadow-[0_0_8px_2px_#d946ef] animate-float-up" style={{ animationDelay: "0.5s", animationDuration: "5s" }} />
          <div className="absolute bottom-12 left-[18%] w-1 h-1 bg-lime-400 rounded-full shadow-[0_0_8px_2px_#a3e635] animate-float-up" style={{ animationDelay: "1s", animationDuration: "7s" }} />
          <div className="absolute top-8 left-[55%] w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-[0_0_8px_2px_#fde047] animate-float-up" style={{ animationDelay: "1.5s", animationDuration: "6s" }} />
          <div className="absolute bottom-8 right-[22%] w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_8px_2px_#67e8f9] animate-float-up" style={{ animationDelay: "2s", animationDuration: "5s" }} />
          <div className="absolute top-16 left-[35%] w-1 h-1 bg-fuchsia-300 rounded-full shadow-[0_0_8px_2px_#f0abfc] animate-float-up" style={{ animationDelay: "2.5s", animationDuration: "8s" }} />
          <div className="absolute bottom-16 right-[40%] w-2 h-2 bg-indigo-300/50 rounded-full shadow-[0_0_10px_2px_#a5b4fc] animate-float-up" style={{ animationDelay: "3s", animationDuration: "7s" }} />
          <div className="absolute top-24 left-[70%] w-1 h-1 bg-pink-300/50 rounded-full shadow-[0_0_8px_2px_#f9a8d4] animate-float-up" style={{ animationDelay: "3.5s", animationDuration: "6s" }} />
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="neon-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="50" y2="0" stroke="#22d3ee" strokeWidth="0.2" />
                <line x1="0" y1="0" x2="0" y2="50" stroke="#d946ef" strokeWidth="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neon-grid)" />
          </svg>
        </div>
        
        {/* Animated border */}
        <div className="absolute inset-0 border border-transparent rounded-2xl" style={{ 
          borderImage: "linear-gradient(135deg, #22d3ee, #d946ef, #a3e635, #22d3ee) 1" 
        }} />
        
        {/* Content */}
        <div className="relative p-6 sm:p-8 lg:p-10 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-cyan-300 text-sm font-medium uppercase tracking-wider drop-shadow-[0_0_10px_#22d3ee]">{today}</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 flex items-center gap-2">
                <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-lime-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(217,70,239,0.6)]">
                  Benvenuto{user?.name ? `, ${user.name}` : ""}
                </span>
                <Sparkles size={24} className="text-fuchsia-400 drop-shadow-[0_0_15px_#d946ef] animate-pulse" />
              </h2>
            </div>
            <div className="hidden sm:block">
              <div className="glass-card rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <Calendar size={22} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-white/60 uppercase tracking-wider">Prossimo evento</p>
                    <p className="text-sm font-semibold text-white truncate max-w-xs">
                      {todayEvents.length > 0 ? todayEvents[0].title : "Nessun evento oggi"}
                    </p>
                    {todayEvents.length > 0 && (
                      <p className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {todayEvents[0].time || "Tutto il giorno"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-white/70 mt-2 max-w-2xl text-base sm:text-lg leading-relaxed">
            Scopri tutti gli eventi, sagre, concerti e manifestazioni in provincia di Latina e nel Lazio
          </p>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/events" className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 active:scale-95">
              <span className="relative z-10">Esplora eventi</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
            </Link>
            {canManageEvents && (
              <Link href="/admin?new=1" className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 hover:from-fuchsia-400 hover:to-purple-500 hover:shadow-fuchsia-500/40 transition-all duration-300 hover:scale-105 active:scale-95">
                <Plus size={16} />
                <span className="relative z-10">Nuovo Evento</span>
                <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
              </Link>
            )}
            
            {/* Sezioni speciali */}
            <Link href="/andiamo-al-cinema" className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-700 shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:to-indigo-600 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
              <Film size={16} />
              <span className="relative z-10">Andiamo al Cinema</span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur" />
            </Link>
            <Link href="/tutti-al-mare" className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-teal-500 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
              <Waves size={16} />
              <span className="relative z-10">Tutti al Mare</span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur" />
            </Link>
            <Link href="/spazio-kids" className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-amber-500 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
              <Rocket size={16} />
              <span className="relative z-10">Kid's</span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur" />
            </Link>
            <Link href="/spazio-venere" className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30 hover:from-pink-400 hover:to-rose-500 hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
              <Heart size={16} />
              <span className="relative z-10">Venere</span>
              <span className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur" />
            </Link>
          </div>
        </div>
      </div>

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
