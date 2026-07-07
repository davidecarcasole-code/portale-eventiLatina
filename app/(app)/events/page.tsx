"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, MapPin, Clock, Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";

const PROVINCES = ["LT", "RM", "FR", "VT", "RI", "CB", "CE", "NA"];
const PROVINCE_NAMES: Record<string, string> = { LT: "Latina", RM: "Roma", FR: "Frosinone", VT: "Viterbo", RI: "Rieti", CB: "Campobasso", CE: "Caserta", NA: "Napoli" };
const TIME_PERIODS = ["mattina", "pomeriggio", "sera", "intera_giornata"];
const TIME_LABELS: Record<string, string> = { mattina: "Mattina", pomeriggio: "Pomeriggio", sera: "Sera", intera_giornata: "Intera Giornata" };

export default function EventsPage() {
  return <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" /></div>}>
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cerca eventi..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg border ${showFilters || hasFilters ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--card-border)] text-[var(--text-secondary)]"}`}>
          <Filter size={18} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm">
            <option value="">Tutte le categorie</option>
            {categories.map((c: any) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={province} onChange={(e) => { setProvince(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm">
            <option value="">Tutte le province</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{PROVINCE_NAMES[p]}</option>)}
          </select>
          <select value={timePeriod} onChange={(e) => { setTimePeriod(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm">
            <option value="">Tutti i momenti</option>
            {TIME_PERIODS.map((t) => <option key={t} value={t}>{TIME_LABELS[t]}</option>)}
          </select>
        </div>
      )}

      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {category && <span className="tag-festive">{categories.find((c: any) => c.slug === category)?.name || category}</span>}
          {province && <span className="tag-festive">{PROVINCE_NAMES[province]}</span>}
          {timePeriod && <span className="tag-festive">{TIME_LABELS[timePeriod]}</span>}
          <button onClick={clearFilters} className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-1">
            <X size={14} /> Cancella filtri
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p>Nessun evento trovato</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map((e: any) => (
              <Link key={e.id} href={`/events/${e.id}`} className="gradient-card rounded-xl overflow-hidden card-hover">
                {e.image_url && <img src={e.image_url} alt="" className="w-full h-36 object-cover" />}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {e.category_color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.category_color }} />}
                    <span className="text-xs text-[var(--text-secondary)]">{e.category_name}</span>
                    {e.is_new && <span className="tag-festive text-[10px]">Nuovo</span>}
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{e.title}</h3>
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(e.date).toLocaleDateString("it-IT")}</span>
                    {e.time && <span className="flex items-center gap-1"><Clock size={12} />{e.time}</span>}
                    {e.city && <span className="flex items-center gap-1"><MapPin size={12} />{e.city}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg border border-[var(--card-border)] disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-sm text-[var(--text-secondary)]">Pagina {page} di {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg border border-[var(--card-border)] disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
