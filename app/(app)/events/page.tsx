"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, MapPin, Clock, Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const PROVINCES = ["LT", "RM", "FR", "VT", "RI", "CB", "CE", "NA"];
const PROVINCE_NAMES: Record<string, string> = { LT: "Latina", RM: "Roma", FR: "Frosinone", VT: "Viterbo", RI: "Rieti", CB: "Campobasso", CE: "Caserta", NA: "Napoli" };
const TIME_PERIODS = ["mattina", "pomeriggio", "sera", "intera_giornata"];
const TIME_LABELS: Record<string, string> = { mattina: "Mattina", pomeriggio: "Pomeriggio", sera: "Sera", intera_giornata: "Intera Giornata" };

export default function EventsPage() {
  return <Suspense fallback={<div className="flex justify-center py-24"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" /><p className="text-sm text-[var(--text-muted)]">Caricamento...</p></div></div>}>
    <EventsContent />
  </Suspense>;
}

function EventsContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [province, setProvince] = useState(searchParams.get("province") || "");
  const [timePeriod, setTimePeriod] = useState(searchParams.get("time_period") || "");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/events?limit=100&page=1")
      .then((r) => r.json())
      .then((data) => {
        const cats = new Map<string, any>();
        for (const e of data.events || []) {
          if (e.category_slug && !cats.has(e.category_slug)) {
            cats.set(e.category_slug, { name: e.category_name, slug: e.category_slug, color: e.category_color });
          }
        }
        setCategories(Array.from(cats.values()));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (province) params.set("province", province);
      if (timePeriod) params.set("time_period", timePeriod);
      params.set("page", String(page));
      params.set("limit", "20");
      try {
        const res = await fetch(`/api/events?${params}`);
        const data = await res.json();
        setEvents(data.events || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, [search, category, province, timePeriod, page]);

  function clearFilters() {
    setSearch(""); setCategory(""); setProvince(""); setTimePeriod(""); setPage(1);
  }

  const hasFilters = search || category || province || timePeriod;

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cerca eventi per titolo, città, categoria..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all placeholder:text-[var(--text-muted)]" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-all ${showFilters || hasFilters ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]" : "border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)]"}`}>
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {showFilters && (
        <div className="glass-card rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-slide-up">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="select">
            <option value="">Tutte le categorie</option>
            {categories.map((c: any) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={province} onChange={(e) => { setProvince(e.target.value); setPage(1); }} className="select">
            <option value="">Tutte le province</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{PROVINCE_NAMES[p]}</option>)}
          </select>
          <select value={timePeriod} onChange={(e) => { setTimePeriod(e.target.value); setPage(1); }} className="select">
            <option value="">Tutti i momenti</option>
            {TIME_PERIODS.map((t) => <option key={t} value={t}>{TIME_LABELS[t]}</option>)}
          </select>
        </div>
      )}

      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {category && <span className="badge">{categories.find((c: any) => c.slug === category)?.name || category}</span>}
          {province && <span className="badge">{PROVINCE_NAMES[province]}</span>}
          {timePeriod && <span className="badge">{TIME_LABELS[timePeriod]}</span>}
          <button onClick={clearFilters} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1 ml-1 font-medium transition-colors">
            <X size={14} /> Cancella filtri
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Caricamento eventi...</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-[var(--accent)]" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)]">Nessun evento trovato</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Prova a modificare i filtri di ricerca</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-muted)]">{pagination.total} eventi trovati</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map((e: any, idx: number) => (
              <Link key={e.id} href={`/events/${e.id}`} className={`glass-card rounded-xl overflow-hidden card-hover group stagger-${Math.min(idx + 1, 5)}`}>
                {e.image_url ? (
                  <div className="relative h-40 overflow-hidden">
                    <img src={e.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {e.category_color && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm">
                          {e.category_name}
                        </span>
                      )}
                      {e.is_new && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500 text-white shadow-sm">Nuovo</span>}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-semibold text-sm text-white drop-shadow-lg line-clamp-2">{e.title}</h3>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {e.category_color && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: e.category_color + "20", color: e.category_color }}>
                          {e.category_name}
                        </span>
                      )}
                      {e.is_new && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">Nuovo</span>}
                    </div>
                    <h3 className="font-semibold text-sm leading-snug mb-2.5 line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{e.title}</h3>
                  </div>
                )}
                <div className="p-4 pt-0 -mt-1">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><Calendar size={11} />{new Date(e.date).toLocaleDateString("it-IT")}</span>
                    {e.time && <span className="flex items-center gap-1"><Clock size={11} />{e.time}</span>}
                    {e.city && <span className="flex items-center gap-1"><MapPin size={11} />{e.city}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="p-2.5 rounded-xl border border-[var(--card-border)] disabled:opacity-30 hover:bg-[var(--accent-subtle)] transition-all">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === pageNum ? "bg-gradient-to-r from-[var(--accent)] to-amber-500 text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)]"}`}>
                      {pageNum}
                    </button>
                  );
                })}
                {pagination.totalPages > 5 && <span className="text-[var(--text-muted)] text-xs">...</span>}
              </div>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}
                className="p-2.5 rounded-xl border border-[var(--card-border)] disabled:opacity-30 hover:bg-[var(--accent-subtle)] transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
