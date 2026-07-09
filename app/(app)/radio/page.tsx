"use client";

import { useEffect, useState } from "react";
import { Radio, Music, Mic, Play, Pause, Trash2, List } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function RadioPage() {
  const { user, token } = useAuthStore();
  const [tab, setTab] = useState("listen");
  const [settings, setSettings] = useState<any>({});
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    fetch("/api/radio/settings").then((r) => r.json()).then(setSettings).catch(() => {});
    fetch("/api/radio/podcasts").then((r) => r.json()).then(setPodcasts).catch(() => {});
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold flex items-center gap-2"><Radio size={20} className="text-[var(--accent)]" /> Web Radio</h1>

      <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-lg p-1">
        {[
          { key: "listen", label: "Ascolta", icon: Radio },
          { key: "podcasts", label: "Podcast", icon: Music },
          ...(isSuperAdmin ? [{ key: "transmit", label: "Trasmetti", icon: Mic }] : []),
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.key ? "bg-white dark:bg-gray-800 shadow-sm" : "text-[var(--text-secondary)]"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "listen" && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent)] to-indigo-500 flex items-center justify-center mx-auto">
            <Radio size={32} className="text-white" />
          </div>
          <h2 className="font-semibold">{settings.station_name || "Radio EventiNLatina"}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{settings.station_description || "Web Radio della provincia di Latina"}</p>
          {settings.is_live && <span className="tag-festive animate-pulse">IN DIRETTA</span>}
          {settings.stream_url && (
            <audio controls className="w-full mt-4">
              <source src={settings.stream_url} type="audio/mpeg" />
            </audio>
          )}
        </div>
      )}

      {tab === "podcasts" && (
        <div className="space-y-3">
          {podcasts.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <Music size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nessun podcast disponibile</p>
            </div>
          ) : (
            podcasts.map((p: any) => (
              <div key={p.id} className="gradient-card rounded-xl p-4 flex items-center gap-4">
                <button onClick={() => setPlaying(playing === p.id ? null : p.id)}
                  className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center flex-shrink-0">
                  {playing === p.id ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm">{p.title}</h3>
                  {p.description && <p className="text-xs text-[var(--text-secondary)] truncate">{p.description}</p>}
                </div>
                {isSuperAdmin && (
                  <button className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "transmit" && isSuperAdmin && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Pannello trasmissione (in sviluppo)</p>
        </div>
      )}
    </div>
  );
}
