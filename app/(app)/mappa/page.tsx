"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Calendar, Clock, Navigation } from "lucide-react";

export default function MappaPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" /></div>}>
      <MappaContent />
    </Suspense>
  );
}

function MappaContent() {
  const searchParams = useSearchParams();
  const cityFilter = searchParams.get("city") || "";
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    import("leaflet").then((L) => {
      setLeafletReady(true);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ timeFilter: "all", limit: "200" });
    if (cityFilter) params.set("city", cityFilter);
    fetch(`/api/events?${params}`)
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [cityFilter]);

  useEffect(() => {
    if (!leafletReady || !mapRef.current || events.length === 0) return;

    let L: any;
    import("leaflet").then((mod) => {
      L = mod;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, { zoomControl: true }).setView([41.4675, 12.9036], 10);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      markersRef.current = [];

      events.forEach((e) => {
        if (!e.city) return;
        const lat = CITY_COORDS[e.city]?.[0];
        const lng = CITY_COORDS[e.city]?.[1];
        if (!lat || !lng) return;

        const color = e.category_color || "#6366f1";
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.eventData = e;
        marker.on("click", () => setSelectedEvent(e));
        markersRef.current.push(marker);
      });

      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.2));
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events, leafletReady]);

  const cities = [...new Set(events.map((e: any) => e.city).filter(Boolean))].sort();

  return (
    <div className="page-container animate-fade-in h-[calc(100vh-80px)] flex flex-col gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin size={22} className="text-[var(--accent)]" /> Mappa Eventi
        </h1>
        <div className="flex gap-2 items-center">
          {cityFilter && (
            <span className="text-xs text-[var(--text-muted)]">
              Eventi a: <strong>{cityFilter}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-[var(--card-border)]">
        {loading && (
          <div className="absolute inset-0 bg-[var(--card-bg)]/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />

        {selectedEvent && (
          <div className="absolute bottom-4 left-4 right-4 z-20 max-w-md mx-auto">
            <div className="glass-card rounded-xl p-4 shadow-xl">
              <div className="flex items-start gap-3">
                {selectedEvent.image_url && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={selectedEvent.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm leading-snug line-clamp-2">{selectedEvent.title}</h3>
                    <button onClick={() => setSelectedEvent(null)} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] shrink-0">✕</button>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><Calendar size={11} />{new Date(selectedEvent.date).toLocaleDateString("it-IT")}</span>
                    {selectedEvent.time && <span className="flex items-center gap-1"><Clock size={11} />{selectedEvent.time}</span>}
                    <span className="flex items-center gap-1"><MapPin size={11} />{selectedEvent.city}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link href={`/events/${selectedEvent.slug || selectedEvent.id}`}
                      className="text-xs px-3 py-1 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity">
                      Dettagli
                    </Link>
                    {selectedEvent.city && CITY_COORDS[selectedEvent.city] && (
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${CITY_COORDS[selectedEvent.city][0]},${CITY_COORDS[selectedEvent.city][1]}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs px-3 py-1 rounded-lg border border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] transition-all flex items-center gap-1">
                        <Navigation size={11} /> Come arrivare
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 overflow-x-auto pb-1">
        <div className="flex gap-2">
          <button onClick={() => window.history.replaceState(null, "", "/mappa")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${!cityFilter ? "bg-[var(--accent)] text-white" : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)]"}`}>
            Tutte
          </button>
          {cities.slice(0, 15).map((c) => (
            <button key={c} onClick={() => {
              window.history.replaceState(null, "", `/mappa?city=${encodeURIComponent(c)}`);
              setSelectedEvent(null);
            }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${cityFilter === c ? "bg-[var(--accent)] text-white" : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)]"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const CITY_COORDS: Record<string, [number, number]> = {
  Latina: [41.4675, 12.9036],
  Aprilia: [41.5918, 12.6545],
  Cisterna: [41.5903, 12.8285],
  Terracina: [41.2924, 13.2497],
  Sabaudia: [41.3005, 13.0241],
  "San Felice Circeo": [41.2357, 13.0927],
  Fondi: [41.3573, 13.4274],
  Formia: [41.2563, 13.6076],
  Gaeta: [41.2137, 13.5684],
  Sperlonga: [41.2592, 13.4351],
  Pontinia: [41.4114, 13.0439],
  Sermoneta: [41.5499, 12.9858],
  Sezze: [41.4988, 13.0573],
  Priverno: [41.4717, 13.1889],
  Cori: [41.6441, 12.9119],
  Norma: [41.5868, 12.9694],
  Bassiano: [41.5503, 13.0272],
  Maenza: [41.5231, 13.1817],
  Roccagorga: [41.5257, 13.1569],
  Prossedi: [41.5167, 13.2603],
  Sonnino: [41.4147, 13.2472],
  "Monte San Biagio": [41.3533, 13.3533],
  Lenola: [41.4089, 13.4606],
  Itri: [41.2917, 13.5317],
  Minturno: [41.2667, 13.7481],
  Castelforte: [41.3014, 13.8303],
  Ventotene: [40.7964, 13.4022],
  Ponza: [40.8953, 12.9583],
  Nettuno: [41.4575, 12.6603],
  Anzio: [41.4478, 12.6217],
  Pomezia: [41.6694, 12.5019],
  Roma: [41.9028, 12.4964],
};
