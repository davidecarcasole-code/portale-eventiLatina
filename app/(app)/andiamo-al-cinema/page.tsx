"use client";

import { useEffect, useState } from "react";
import {
  Clapperboard,
  MapPin,
  Clock,
  Calendar,
  Film,
  ExternalLink,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { CINEMAS_LATINA } from "@/lib/cinema/cinemas";

interface Showtime {
  id: number;
  filmTitle: string;
  filmDescription?: string;
  director?: string;
  genre?: string;
  year?: number;
  duration?: string;
  posterUrl?: string;
  trailerUrl?: string;
  showtimes: string[];
  sourceUrl?: string;
  scrapedAt?: string;
  isAdmin?: boolean;
}

interface Cinema {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  province: string;
  website?: string;
  films: Showtime[];
}

export default function CinemaPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [activeCinema, setActiveCinema] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/cinemas").then((r) => r.json()),
      fetch("/api/events?category=cinema&limit=100&timeFilter=all").then((r) => r.json()),
    ])
      .then(([cinemaData, eventsData]) => {
        const list: Cinema[] = cinemaData.cinemas || [];
        const adminEvents = eventsData.events || [];

        for (const event of adminEvents) {
          const cinemaName = (event.location || "").trim();
          if (!cinemaName) continue;
          const cinema = list.find((c) =>
            c.name.toLowerCase() === cinemaName.toLowerCase() ||
            c.slug.toLowerCase() === cinemaName.toLowerCase()
          );
          if (cinema) {
            cinema.films.push({
              id: -event.id,
              filmTitle: event.title,
              filmDescription: event.description,
              posterUrl: event.image_url,
              showtimes: event.time ? [event.time] : [],
              sourceUrl: event.source_url,
              isAdmin: true,
            });
          }
        }

        setCinemas(list);
        if (list.length > 0) setActiveCinema(list[0].slug);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = cinemas.find((c) => c.slug === activeCinema);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-[url('/bannercinema.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-indigo-900/60 to-indigo-950/80" />
        <div
          className="absolute top-6 right-12 w-3 h-3 rounded-full bg-purple-300/40 animate-float-up"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="absolute top-10 left-1/4 w-2 h-2 rounded-full bg-indigo-300/40 animate-float-up"
          style={{ animationDelay: "0.7s" }}
        />
        <div
          className="absolute bottom-12 right-1/3 w-4 h-4 rounded-full bg-purple-300/30 animate-float-up"
          style={{ animationDelay: "1.2s" }}
        />
        <div className="relative p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <Clapperboard size={28} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-purple-200 text-sm font-medium uppercase tracking-widest">
                Sezione
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">
                Andiamo al Cinema
              </h1>
            </div>
          </div>
          <p className="text-white/90 max-w-xl text-sm sm:text-base leading-relaxed">
            Scopri tutti i cinema di Latina, gli orari delle proiezioni e le
            ultime uscite. Programmi aggiornati in tempo reale.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">
              Caricamento cinema...
            </p>
          </div>
        </div>
      ) : cinemas.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
            <Clapperboard size={28} className="text-purple-500" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)]">
            Nessun cinema trovato
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Prova a ricaricare più tardi
          </p>
        </div>
      ) : (
        <>
          {/* Cinema tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {cinemas.map((cinema) => (
              <button
                key={cinema.slug}
                onClick={() => setActiveCinema(cinema.slug)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeCinema === cinema.slug
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 scale-105"
                    : "bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)]"
                }`}
              >
                {cinema.name}
              </button>
            ))}
          </div>

          {/* Cinema info */}
          {selected && (
            <div className="glass-card rounded-2xl p-4 sm:p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Film size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-[var(--text-primary)]">
                    {selected.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-secondary)]">
                    <MapPin size={14} className="text-purple-500" />
                    <span>
                      {selected.address}, {selected.city} ({selected.province})
                    </span>
                  </div>
                  {selected.website && (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs text-purple-500 hover:text-purple-400 transition-colors"
                    >
                      <ExternalLink size={12} />
                      Sito ufficiale
                    </a>
                  )}
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-3">
                {selected.films.length} film in programmazione
              </p>
            </div>
          )}

          {/* Films grid */}
          {selected && selected.films.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {selected.films.map((film) => (
                <div
                  key={film.id}
                  className="glass-card rounded-2xl overflow-hidden hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 group"
                >
                  {/* Poster */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={film.posterUrl || "/eventincinema.png"}
                      alt={film.filmTitle}
                      onError={(e) => { (e.target as HTMLImageElement).src = "/eventincinema.png"; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    {/* Floating bubbles like hero banner */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-300/40 animate-float-up" style={{ animationDelay: "0.2s" }} />
                      <div className="absolute top-8 left-1/4 w-1.5 h-1.5 rounded-full bg-indigo-300/40 animate-float-up" style={{ animationDelay: "0.7s" }} />
                      <div className="absolute bottom-4 right-1/3 w-3 h-3 rounded-full bg-purple-300/30 animate-float-up" style={{ animationDelay: "1.2s" }} />
                    </div>
                    {film.isAdmin && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-lg">
                        <Sparkles size={10} />
                        Speciale
                      </span>
                    )}
                    {film.year && (
                      <span className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center gap-1">
                        <Calendar size={10} />
                        {film.year}
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-semibold text-sm text-white drop-shadow-lg line-clamp-2">
                        {film.filmTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-4 pb-4 pt-3 space-y-2">
                    {film.director && (
                      <p className="text-xs text-[var(--text-secondary)]">
                        <span className="text-[var(--text-muted)]">
                          Regia:
                        </span>{" "}
                        {film.director}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                      {film.genre && (
                        <span className="flex items-center gap-1">
                          <Clapperboard size={10} />
                          {film.genre}
                        </span>
                      )}
                      {film.duration && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {film.duration}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {film.filmDescription && (
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3">
                        {film.filmDescription}
                      </p>
                    )}

                    {/* Showtimes */}
                    {film.showtimes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {film.showtimes.map((time, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          >
                            <Clock size={9} />
                            {time}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Trailer */}
                    {film.trailerUrl && (
                      <a
                        href={film.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-500 hover:text-purple-400 transition-colors mt-1"
                      >
                        <PlayCircle size={14} />
                        Trailer
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : selected ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <Film size={28} className="text-purple-500" />
              </div>
              <p className="text-lg font-medium text-[var(--text-primary)]">
                Nessun film in programmazione
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                I dati verranno aggiornati al prossimo scraping
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
