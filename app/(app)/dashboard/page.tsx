"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Sparkles, MapPin, Clock, Music, Theater, Book, Trophy, Leaf, Mountain, Car, Sparkles as SparklesIcon, Wine, Baby } from "lucide-react";

const categoryIcons: Record<string, any> = {
  musica: Music, teatro: Theater, cultura: Book, sport: Trophy, natura: Leaf,
  trekking: Mountain, montagna: Mountain, gite: Car, spettacolo: SparklesIcon,
  enogastronomia: Wine, bambini: Baby,
};

export default function DashboardPage() {
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
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-6 text-white">
        <p className="text-white/80 text-sm">{today}</p>
        <h2 className="text-2xl font-bold mt-1">Benvenuto su EventiNLatina</h2>
        <p className="text-white/80 mt-1">Scopri tutti gli eventi in provincia di Latina</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Oggi", value: todayEvents.length, icon: Calendar, color: "from-blue-500 to-blue-600" },
          { label: "Prossimi Eventi", value: events.length, icon: TrendingUp, color: "from-green-500 to-green-600" },
          { label: "Categorie", value: categories.length, icon: Sparkles, color: "from-purple-500 to-purple-600" },
        ].map((s) => (
          <div key={s.label} className="gradient-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Categorie</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Calendar;
              return (
                <Link key={cat.slug} href={`/events?category=${cat.slug}`}
                  className="flex-shrink-0 gradient-card rounded-xl p-3 flex flex-col items-center gap-2 min-w-[90px]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-medium text-center">{cat.name}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{cat.count} eventi</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {todayEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Eventi di Oggi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {todayEvents.slice(0, 6).map((e: any) => (
              <Link key={e.id} href={`/events/${e.id}`} className="gradient-card rounded-xl p-4 card-hover">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: e.category_color + "20", color: e.category_color }}>
                    {React.createElement(categoryIcons[e.category_slug] || Calendar, { size: 18 })}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm truncate">{e.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                      {e.time && <span className="flex items-center gap-1"><Clock size={12} />{e.time}</span>}
                      {e.city && <span className="flex items-center gap-1"><MapPin size={12} />{e.city}</span>}
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Prossimi Eventi</h3>
            <Link href="/events" className="text-sm text-[var(--accent)] hover:underline">Vedi tutti</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.slice(0, 9).map((e: any) => (
              <Link key={e.id} href={`/events/${e.id}`} className="gradient-card rounded-xl p-4 card-hover">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: e.category_color + "20", color: e.category_color }}>
                    {React.createElement(categoryIcons[e.category_slug] || Calendar, { size: 18 })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm truncate">{e.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{new Date(e.date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                      {e.time && <span className="flex items-center gap-1"><Clock size={12} />{e.time}</span>}
                      {e.city && <span className="flex items-center gap-1"><MapPin size={12} />{e.city}</span>}
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
