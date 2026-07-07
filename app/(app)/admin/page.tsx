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
    return <div className="text-center py-12 text-[var(--text-secondary)]">Accesso negato</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold flex items-center gap-2"><Shield size={20} className="text-[var(--accent)]" /> Pannello Admin</h1>
      <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-lg p-1 overflow-x-auto">
        {TABS.filter((t) => !t.adminOnly || isSuperAdmin).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${tab === t.key ? "bg-white dark:bg-gray-800 shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
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
      <p className="text-sm text-[var(--text-secondary)]">{events.length} eventi totali</p>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {events.map((e: any) => (
          <div key={e.id} className="gradient-card rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{e.title}</p>
              <p className="text-xs text-[var(--text-secondary)]">{e.category_name} • {new Date(e.date).toLocaleDateString("it-IT")}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <a href={`/events/${e.id}`} className="p-1.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"><Edit3 size={14} /></a>
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
    <div className="space-y-3">
      <button onClick={runScraper} disabled={loading} className="px-4 py-2 btn-festive text-white rounded-lg text-sm flex items-center gap-2">
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> {loading ? "Eseguendo..." : "Esegui Scraper"}
      </button>
      {result && <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">{result}</pre>}
    </div>
  );
}

function SearchConfigTab({ token }: { token: string }) {
  return <p className="text-sm text-[var(--text-secondary)]">Configurazione motore di ricerca (in sviluppo)</p>;
}

function AgentTab({ token }: { token: string }) {
  return <p className="text-sm text-[var(--text-secondary)]">Agent AI (in sviluppo)</p>;
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
        <div key={u.id} className="gradient-card rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{u.name || "—"}</p>
            <p className="text-xs text-[var(--text-secondary)]">{u.email} • {u.role}</p>
          </div>
          <span className={`tag-festive text-[10px] ${u.role === "super_admin" ? "bg-purple-500" : u.role === "admin" ? "bg-blue-500" : ""}`}>{u.role}</span>
        </div>
      ))}
    </div>
  );
}
