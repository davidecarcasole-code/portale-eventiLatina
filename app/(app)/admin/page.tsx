"use client";

import { useEffect, useState } from "react";
import { Shield, Globe, Search, Users, Brain, RefreshCw, Plus, Trash2, Edit3 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const TABS = [
  { key: "events", label: "Eventi", icon: Globe },
  { key: "scraper", label: "Motore Ricerca", icon: Search },
  { key: "searchconfig", label: "Criteri Ricerca", icon: RefreshCw },
  { key: "agent", label: "Agent AI", icon: Brain },
  { key: "users", label: "Utenti", icon: Users, adminOnly: true },
];

export default function AdminPage() {
  const { user, token } = useAuthStore();
  const [tab, setTab] = useState("events");
  const isSuperAdmin = user?.role === "super_admin";

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <div className="text-center py-24 text-[var(--text-secondary)]">Accesso negato</div>;
  }

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Pannello Admin</h1>
          <p className="text-sm text-[var(--text-muted)]">Gestisci eventi, scraper e utenti</p>
        </div>
      </div>

      <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 overflow-x-auto">
        {TABS.filter((t) => !t.adminOnly || isSuperAdmin).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.key ? "bg-[var(--card-bg)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsTab token={token!} />}
      {tab === "scraper" && <ScraperTab token={token!} />}
      {tab === "searchconfig" && <SearchConfigTab token={token!} />}
      {tab === "agent" && <AgentTab token={token!} />}
      {tab === "users" && isSuperAdmin && <UsersTab token={token!} />}
    </div>
  );
}

function EventsTab({ token }: { token: string }) {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/events?limit=100&dateFrom=2020-01-01", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setEvents(d.events || [])).catch(() => {});
  }, [token]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{events.length} eventi totali</p>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {events.map((e: any) => (
          <div key={e.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{e.title}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                <span className="badge text-[10px]">{e.category_name}</span>{" "}
                <span className="ml-1">{new Date(e.date).toLocaleDateString("it-IT")}</span>
                {e.city && <span className="ml-1">· {e.city}</span>}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <a href={`/events/${e.id}`} className="btn-ghost p-2 rounded-lg"><Edit3 size={14} /></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScraperTab({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function runScraper() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/scraper/run", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) { setResult(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Motore di Ricerca Eventi</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">Esegue lo scraping da CentroItaliaEvents, LazioNascosto e LatinaToday</p>
      </div>
      <button onClick={runScraper} disabled={loading}
        className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        {loading ? "Eseguendo..." : "Esegui Scraper"}
      </button>
      {result && (
        <div className="relative">
          <div className="absolute top-0 right-0">
            <button onClick={() => setResult("")} className="text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)]">Chiudi</button>
          </div>
          <pre className="text-xs bg-gray-900 dark:bg-black text-green-400 p-4 rounded-xl overflow-x-auto mt-2">{result}</pre>
        </div>
      )}
    </div>
  );
}

function SearchConfigTab({ token }: { token: string }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="font-semibold">Criteri di Ricerca</h3>
      <p className="text-sm text-[var(--text-muted)] mt-1">Configurazione motore di ricerca (in sviluppo)</p>
    </div>
  );
}

function AgentTab({ token }: { token: string }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="font-semibold">Agent AI</h3>
      <p className="text-sm text-[var(--text-muted)] mt-1">Agent AI (in sviluppo)</p>
    </div>
  );
}

function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then(setUsers).catch(() => {});
  }, [token]);

  return (
    <div className="space-y-2">
      {users.map((u: any) => (
        <div key={u.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-amber-400 flex items-center justify-center text-white text-xs font-bold">
              {u.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium">{u.name || "—"}</p>
              <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
            </div>
          </div>
          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
            u.role === "super_admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
            u.role === "admin" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}>{u.role}</span>
        </div>
      ))}
    </div>
  );
}
