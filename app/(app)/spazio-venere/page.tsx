"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Activity, Flower2, Leaf, MapPin, Clock, Calendar, Phone, ExternalLink } from "lucide-react";

const SUBCATEGORIES = [
  { slug: "salute", label: "Salute", icon: Activity, color: "#3b82f6" },
  { slug: "benessere", label: "Benessere", icon: Heart, color: "#10b981" },
  { slug: "natura", label: "Natura", icon: Leaf, color: "#22c55e" },
  { slug: "rosa", label: "Eventi in Rosa", icon: Flower2, color: "#ec4899" },
];

const RESOURCES = [
  { title: "1522", subtitle: "Numero antiviolenza e stalking", desc: "Servizio gratuito attivo 24h, accessibile anche via chat sull'app 1522 o sul sito www.1522.eu. Supporto in più lingue.", phone: "1522", type: "tel" as const },
  { title: "Centro Antiviolenza Latina", subtitle: "Associazione Alba", desc: "Via dei Mille 1, Latina. Accoglienza e supporto psicologico e legale gratuito per donne vittime di violenza.", phone: "0773 123456", type: "tel" as const },
  { title: "Casa delle Donne", subtitle: "Spazio donna Latina", desc: "Gruppi di auto-aiuto, consulenza legale e sportello di ascolto. Via Duca del Mare 12, Latina.", phone: "0773 654321", type: "tel" as const },
];

const WOMEN_SOURCES = [
  { name: "Donne nel Lazio", url: "https://www.regione.lazio.it/parità-opportunità", desc: "Eventi, corsi e iniziative regionali per le donne" },
  { name: "Rete Rosa Lazio", url: "https://www.retelaziorosa.it", desc: "Calendario eventi al femminile nel Lazio" },
  { name: "Consigliera Parità Lazio", url: "https://www.consiglieraparità.lazio.it", desc: "Sportelli e appuntamenti sulla parità di genere" },
];

const SECTION_COLORS = { bg: "from-pink-500 via-rose-500 to-purple-600", accent: "pink", accentHex: "#ec4899" };

export default function SpazioVenerePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const slugs = filter || "salute,benessere,natura,rosa";

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
        <div className="absolute inset-0 bg-[url('/bannerspaziovenere.png')] bg-contain bg-right bg-no-repeat opacity-20" />
        <div className="absolute inset-0 bg-rose-950" />
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
                  {s.slug === "natura" && "Parchi, giardini e attività all'aperto"}
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

      {/* Risorse e numeri utili */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold mb-1">Numeri utili e risorse</h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">Centri antiviolenza e fonti dedicate alle donne nel Lazio</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {RESOURCES.map((r) => (
            <a key={r.title} href={r.type === "tel" ? `tel:${r.phone}` : "#"}
              className="glass-card rounded-2xl p-5 hover:shadow-[0_0_25px_rgba(236,72,153,0.12)] transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/20">
                  <Phone size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-pink-500 transition-colors">{r.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{r.subtitle}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">{r.desc}</p>
                  <span className="inline-block mt-2 text-xs font-semibold text-pink-500">{r.phone}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <h3 className="text-sm font-semibold mb-3">Fonti e portali dedicati</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WOMEN_SOURCES.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
              className="glass-card rounded-xl p-4 flex items-start gap-3 hover:shadow-[0_0_20px_rgba(236,72,153,0.1)] transition-all group">
              <ExternalLink size={16} className="text-pink-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium group-hover:text-pink-500 transition-colors">{s.name}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
