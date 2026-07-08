"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Globe, Search, Users, Brain, RefreshCw, Plus, Trash2, Edit3, X, Sparkles, Radio, Power, PowerOff, Play } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const TABS = [
  { key: "events", label: "Eventi", icon: Globe },
  { key: "sources", label: "Fonti", icon: Radio },
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg animate-pulse-neon">
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
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.key ? "bg-white dark:bg-gray-800 shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsTab token={token!} />}
      {tab === "sources" && <SourcesTab token={token!} />}
      {tab === "scraper" && <ScraperTab token={token!} />}
      {tab === "searchconfig" && <SearchConfigTab />}
      {tab === "agent" && <AgentTab />}
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
              <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: (e.category_color || "#f97316") + "15", color: e.category_color || "var(--accent)" }}>
                  {e.category_name}
                </span>
                <span>{new Date(e.date).toLocaleDateString("it-IT")}</span>
                {e.city && <span>· {e.city}</span>}
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
        <h3 className="font-semibold flex items-center gap-2"><Sparkles size={16} className="text-[var(--accent)]" /> Motore di Ricerca Eventi</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">Esegue lo scraping da tutte le fonti attive. Gestisci le fonti nella tab "Fonti".</p>
      </div>
      <button onClick={runScraper} disabled={loading}
        className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        {loading ? "Eseguendo..." : "Esegui Scraper"}
      </button>
      {result && (
        <div className="relative">
          <button onClick={() => setResult("")} className="absolute top-2 right-2 text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)] bg-gray-900/50 px-2 py-1 rounded-lg z-10">Chiudi</button>
          <pre className="text-xs bg-gray-900 dark:bg-black text-green-400 p-4 rounded-xl overflow-x-auto mt-2 max-h-96 overflow-y-auto">{result}</pre>
        </div>
      )}
    </div>
  );
}

function SourcesTab({ token }: { token: string }) {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<string>("");

  const loadSources = useCallback(async () => {
    try {
      const r = await fetch("/api/scraper/sources", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setSources((await r.json()).sources || []);
    } catch {}
  }, [token]);

  useEffect(() => { loadSources(); }, [loadSources]);

  async function toggleSource(src: any) {
    setLoading(true);
    try {
      await fetch("/api/scraper/sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: src.id, isActive: !src.isActive }),
      });
      loadSources();
    } catch {}
    setLoading(false);
  }

  async function runSingleSource(type: string, name: string) {
    setRunning(name);
    setRunResults("");
    try {
      const r = await fetch("/api/scraper/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ source: type }),
      });
      const data = await r.json();
      setRunResults(`${name}: ${JSON.stringify(data.results?.[0] || data)}`);
    } catch (err: any) {
      setRunResults(`${name}: ${err.message}`);
    }
    setRunning(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{sources.length} fonti configurate</p>
      </div>

      <div className="space-y-2">
        {sources.map((src: any) => (
          <div key={src.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${src.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                <Radio size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{src.name}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${src.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                    {src.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                  <span>{src.url?.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  <span>· {src.eventCount ?? 0} eventi</span>
                  {src.lastScrapedAt && <span>· Ultimo scrape: {new Date(src.lastScrapedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => runSingleSource(src.type, src.name)} disabled={running !== null}
                className="btn-ghost p-2 rounded-lg text-xs disabled:opacity-30" title="Esegui questa fonte">
                <Play size={14} className={running === src.name ? "animate-pulse text-[var(--accent)]" : ""} />
              </button>
              <button onClick={() => toggleSource(src)} disabled={loading}
                className={`btn-ghost p-2 rounded-lg ${src.isActive ? "text-green-600" : "text-gray-400"}`} title={src.isActive ? "Disattiva" : "Attiva"}>
                {src.isActive ? <Power size={14} /> : <PowerOff size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {runResults && (
        <pre className="text-xs bg-gray-900 dark:bg-black text-green-400 p-4 rounded-xl overflow-x-auto max-h-40 overflow-y-auto">{runResults}</pre>
      )}
    </div>
  );
}

function SearchConfigTab() {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="font-semibold">Criteri di Ricerca</h3>
      <p className="text-sm text-[var(--text-muted)] mt-1">Configurazione motore di ricerca (in sviluppo)</p>
    </div>
  );
}

function AgentTab() {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="font-semibold">Agent AI</h3>
      <p className="text-sm text-[var(--text-muted)] mt-1">Agent AI (in sviluppo)</p>
    </div>
  );
}

function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const r = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
      setUsers(await r.json());
    } catch {}
  }, [token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/users", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error || "Errore"); return; }
    setShowCreate(false);
    setForm({ name: "", email: "", password: "", role: "user" });
    loadUsers();
  }

  async function handleUpdate(id: string) {
    setError("");
    const r = await fetch(`/api/users/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: form.name, email: form.email, role: form.role }),
    });
    if (!r.ok) { const d = await r.json(); setError(d.error || "Errore"); return; }
    setEditingId(null);
    loadUsers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo utente?")) return;
    const r = await fetch(`/api/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) loadUsers();
  }

  function startEdit(u: any) {
    setEditingId(u.id);
    setForm({ name: u.name || "", email: u.email || "", password: "", role: u.role });
    setError("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{users.length} utenti</p>
        <button onClick={() => { setShowCreate(true); setError(""); setForm({ name: "", email: "", password: "", role: "user" }); }}
          className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
          <Plus size={14} /> Nuovo Utente
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card rounded-xl p-5 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Crea Utente</h4>
            <button type="button" onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="input" required />
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" className="input" required minLength={6} />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="select">
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 py-2 rounded-xl text-sm">Crea Utente</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-[var(--card-border)] text-sm">Annulla</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {users.map((u: any) => (
          editingId === u.id ? (
            <div key={u.id} className="glass-card rounded-xl p-5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Modifica {u.name}</h4>
                <button type="button" onClick={() => setEditingId(null)} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="input" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input" />
              </div>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="select">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => handleUpdate(u.id)} className="btn-primary flex-1 py-2 rounded-xl text-sm">Salva</button>
                <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl border border-[var(--card-border)] text-sm">Annulla</button>
              </div>
            </div>
          ) : (
            <div key={u.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-amber-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name || "—"}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                  u.role === "super_admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                  u.role === "admin" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>{u.role}</span>
                <button onClick={() => startEdit(u)} className="btn-ghost p-1.5 rounded-lg"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(u.id)} className="btn-ghost p-1.5 rounded-lg hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
