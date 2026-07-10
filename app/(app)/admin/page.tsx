"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Globe, Search, Users, Brain, RefreshCw, Plus, Trash2, Edit3, X, Sparkles, Radio, Power, PowerOff, Play, Film, Megaphone, Briefcase, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const TABS = [
  { key: "events", label: "Eventi", icon: Globe },
  { key: "videos", label: "Video", icon: Film },
  { key: "ads", label: "Pubblicità", icon: Megaphone },
  { key: "sources", label: "Fonti", icon: Radio },
  { key: "scraper", label: "Motore Ricerca", icon: Search },
  { key: "searchconfig", label: "Criteri Ricerca", icon: RefreshCw },
  { key: "agent", label: "Agent AI", icon: Brain },
  { key: "publishers", label: "Publisher", icon: Briefcase, adminOnly: true },
  { key: "users", label: "Utenti", icon: Users, adminOnly: true },
];

export default function AdminPage() {
  const { user, token } = useAuthStore();
  const [tab, setTab] = useState("events");
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isPublisher = user?.role === "publisher";

  if (!user || (!isAdmin && !isPublisher)) {
    return <div className="text-center py-24 text-[var(--text-secondary)]">Accesso negato</div>;
  }

  const visibleTabs = TABS.filter((t) => {
    if (t.adminOnly) return isSuperAdmin;
    if (isPublisher) return t.key === "events";
    return true;
  });

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg animate-pulse-neon">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{isPublisher ? "Pannello Publisher" : "Pannello Admin"}</h1>
          <p className="text-sm text-[var(--text-muted)]">{isPublisher ? "Gestisci i tuoi eventi" : "Gestisci eventi, scraper e utenti"}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 overflow-x-auto">
        {visibleTabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.key ? "bg-white dark:bg-gray-800 shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsTab token={token!} />}
      {tab === "videos" && <VideosTab token={token!} />}
      {tab === "ads" && <AdsTab token={token!} />}
      {tab === "sources" && <SourcesTab token={token!} />}
      {tab === "scraper" && <ScraperTab token={token!} />}
      {tab === "searchconfig" && <SearchConfigTab />}
      {tab === "agent" && <AgentTab token={token!} />}
      {tab === "publishers" && isSuperAdmin && <PublishersTab token={token!} />}
      {tab === "users" && isSuperAdmin && <UsersTab token={token!} />}
    </div>
  );
}

function EventsTab({ token }: { token: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", end_date: "", time: "", location: "", address: "", city: "Latina", province: "LT", category_id: "", image_url: "", source_url: "", source_name: "" });
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      const r = await fetch("/api/events?limit=100&dateFrom=2020-01-01&status=all", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setEvents(d.events || []);
    } catch {}
  }, [token]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.ok && r.json()).then(d => { if (d) setCategories(d); }).catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error || "Errore"); return; }
    setShowCreate(false);
    setForm({ title: "", description: "", date: "", end_date: "", time: "", location: "", address: "", city: "Latina", province: "LT", category_id: "", image_url: "", source_url: "", source_name: "" });
    loadEvents();
  }

  async function updateEventStatus(eventId: number, status: string) {
    const r = await fetch(`/api/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (r.ok) loadEvents();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{events.length} eventi totali</p>
        <div className="flex gap-2">
          <button onClick={async () => { if (!confirm("Eliminare tutti gli eventi con data 2026-01-01 (import errati)?")) return; setCleaning(true); try { const r = await fetch("/api/scraper/cleanup", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); alert(`Eliminati ${d.deleted} eventi`); window.location.reload() } catch {} finally { setCleaning(false) } }}
            className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 text-red-500 hover:bg-red-50" disabled={cleaning}>
            <Trash2 size={14} /> {cleaning ? "Pulendo..." : "Pulisci date errate"}
          </button>
          <button onClick={() => { setShowCreate(true); setError(""); setForm({ title: "", description: "", date: "", end_date: "", time: "", location: "", address: "", city: "Latina", province: "LT", category_id: "", image_url: "", source_url: "", source_name: "" }); }}
            className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
            <Plus size={14} /> Nuovo Evento
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card rounded-xl p-5 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Crea Nuovo Evento</h4>
            <button type="button" onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titolo *" className="input" required />
            <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} type="date" placeholder="Data *" className="input" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} type="date" placeholder="Data fine" className="input" />
            <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} type="time" placeholder="Orario" className="input" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Luogo" className="input" />
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Indirizzo" className="input" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Città" className="input" />
            <select value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} className="select">
              {["LT","RM","FR","VT","RI","CB","CE","NA"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="select" required>
              <option value="">Seleziona categoria *</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="URL immagine copertina" className="input" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrizione" className="input min-h-[80px]" rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.source_url} onChange={e => setForm({ ...form, source_url: e.target.value })} placeholder="URL fonte (es. https://...)" className="input" />
            <input value={form.source_name} onChange={e => setForm({ ...form, source_name: e.target.value })} placeholder="Nome fonte" className="input" />
          </div>
          {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 py-2 rounded-xl text-sm">Crea Evento</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-[var(--card-border)] text-sm">Annulla</button>
          </div>
        </form>
      )}

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
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                e.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                e.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              }`}>
                {e.status === "pending" ? "In attesa" : e.status === "rejected" ? "Rifiutato" : "Approvato"}
              </span>
              <a href={`/events/${e.id}`} className="btn-ghost p-2 rounded-lg"><Edit3 size={14} /></a>
              {e.status === "pending" && (
                <>
                  <button onClick={() => updateEventStatus(e.id, "approved")} className="btn-ghost p-2 rounded-lg hover:text-green-500" title="Approva"><CheckCircle size={14} /></button>
                  <button onClick={() => updateEventStatus(e.id, "rejected")} className="btn-ghost p-2 rounded-lg hover:text-red-500" title="Rifiuta"><XCircle size={14} /></button>
                </>
              )}
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
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", type: "" });
  const [error, setError] = useState("");

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/scraper/sources", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: -1, ...form }),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error || "Errore"); return; }
    setShowCreate(false);
    setForm({ name: "", url: "", type: "" });
    loadSources();
  }

  async function handleDelete(src: any) {
    if (!confirm(`Eliminare la fonte "${src.name}"?`)) return;
    const r = await fetch("/api/scraper/sources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: src.id }),
    });
    if (r.ok) loadSources();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{sources.length} fonti configurate</p>
        <button onClick={() => { setShowCreate(true); setError(""); setForm({ name: "", url: "", type: "" }); }}
          className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
          <Plus size={14} /> Nuova Fonte
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card rounded-xl p-5 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Aggiungi Fonte</h4>
            <button type="button" onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome (es. CentroItaliaEvents)" className="input" required />
            <input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="Tipo scraper (es. centroitalia)" className="input" required />
          </div>
          <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="URL sorgente (es. https://...)" className="input" required />
          {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</p>}
          <p className="text-xs text-[var(--text-muted)]">Il tipo deve corrispondere a uno scraper registrato (centroitalia, lazionascosto, latinatoday) oppure lascialo vuoto per fonti future.</p>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 py-2 rounded-xl text-sm">Aggiungi</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-[var(--card-border)] text-sm">Annulla</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sources.length === 0 && !showCreate && (
          <div className="glass-card rounded-xl p-8 text-center">
            <Radio size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
            <p className="text-sm text-[var(--text-muted)]">Nessuna fonte configurata. Aggiungine una o esegui lo scraper per crearle automaticamente.</p>
          </div>
        )}
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
                    {src.type || "—"}
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
              <button onClick={() => runSingleSource(src.type, src.name)} disabled={running !== null || !src.type}
                className="btn-ghost p-2 rounded-lg text-xs disabled:opacity-30" title={src.type ? "Esegui questa fonte" : "Nessuno scraper associato"}>
                <Play size={14} className={running === src.name ? "animate-pulse text-[var(--accent)]" : ""} />
              </button>
              <button onClick={() => toggleSource(src)} disabled={loading}
                className={`btn-ghost p-2 rounded-lg ${src.isActive ? "text-green-600" : "text-gray-400"}`} title={src.isActive ? "Disattiva" : "Attiva"}>
                {src.isActive ? <Power size={14} /> : <PowerOff size={14} />}
              </button>
              <button onClick={() => handleDelete(src)} className="btn-ghost p-1.5 rounded-lg hover:text-red-500" title="Elimina">
                <Trash2 size={14} />
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

function AgentTab({ token }: { token: string }) {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function runTask(task: string, label: string) {
    setRunning(label);
    setError("");
    setResults([]);
    try {
      const r = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ task }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Errore"); return; }
      setResults(data.results || []);
    } catch (err: any) { setError(err.message); }
    finally { setRunning(null); }
  }

  return (
    <div className="space-y-3">
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Brain size={16} className="text-[var(--accent)]" /> Agent AI</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">Classificazione, arricchimento, dedup e riassunto eventi tramite AI</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { task: 'reclassify', label: 'Riclassifica Tutti', desc: 'Riclassifica tutti gli eventi con le nuove categorie', primary: true },
            { task: 'classify', label: 'Classifica Eventi', desc: 'Assegna categoria a eventi senza' },
            { task: 'enrich', label: 'Arricchisci Descrizioni', desc: 'Genera descrizioni per eventi senza' },
            { task: 'dedup', label: 'Dedup Avanzato', desc: 'Trova e rimuovi duplicati tra fonti' },
            { task: 'summarize', label: 'Riassunto Eventi', desc: 'Genera riassunto dei prossimi eventi' },
            { task: 'all', label: 'Esegui Tutto', desc: 'Classifica + Arricchisci + Dedup + Riassunto', primary: true },
          ].map((b) => (
            <button key={b.task} onClick={() => runTask(b.task, b.label)} disabled={running !== null}
              className={`px-4 py-3 rounded-xl text-xs flex flex-col items-start gap-0.5 ${b.primary ? 'btn-primary' : 'glass-card hover:shadow-[0_0_15px_var(--accent-glow)]'} ${running !== null ? 'opacity-50' : ''} transition-all`}>
              <span className="font-semibold">{running === b.label ? "Eseguendo..." : b.label}</span>
              <span className="opacity-70">{b.desc}</span>
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</p>}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase text-[var(--accent)]">{r.task}</span>
                  <span className="text-xs text-[var(--text-muted)]">· {r.processed} elaborati</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{r.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VideosTab({ token }: { token: string }) {
  const [videos, setVideos] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", embedUrl: "", thumbnail: "", platform: "youtube", sortOrder: 0 });
  const [error, setError] = useState("");

  const loadVideos = useCallback(async () => {
    try {
      const r = await fetch("/api/videos?all=true", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setVideos(d.videos || []);
    } catch {}
  }, [token]);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error || "Errore"); return; }
    setShowCreate(false);
    setForm({ title: "", description: "", embedUrl: "", thumbnail: "", platform: "youtube", sortOrder: 0 });
    loadVideos();
  }

  async function handleDelete(id: number) {
    if (!confirm("Eliminare questo video?")) return;
    const r = await fetch(`/api/videos/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) loadVideos();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{videos.length} video</p>
        <button onClick={() => { setShowCreate(true); setError(""); }}
          className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
          <Plus size={14} /> Nuovo Video
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card rounded-xl p-5 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Aggiungi Video</h4>
            <button type="button" onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]"><X size={16} /></button>
          </div>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titolo *" className="input" required />
          <input value={form.embedUrl} onChange={e => setForm({ ...form, embedUrl: e.target.value })} placeholder="URL (YouTube, Vimeo, Instagram, TikTok...) *" className="input" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="select">
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="other">Altro</option>
            </select>
            <input value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} placeholder="URL miniatura (opzionale)" className="input" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrizione (opzionale)" className="input min-h-[60px]" rows={2} />
          {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 py-2 rounded-xl text-sm">Aggiungi Video</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-[var(--card-border)] text-sm">Annulla</button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {videos.map((v: any) => (
          <div key={v.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                <Film size={16} className="text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{v.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-medium text-[var(--accent)]">{v.platform}</span>
                  <span>· ordine {v.sortOrder}</span>
                </p>
                <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5 font-mono">{v.embedUrl}</p>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <a href={`/video`} target="_blank" className="btn-ghost p-2 rounded-lg"><Play size={14} /></a>
              <button onClick={() => handleDelete(v.id)} className="btn-ghost p-2 rounded-lg hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdsTab({ token }: { token: string }) {
  const [ads, setAds] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", imageUrl: "", linkUrl: "", placement: "sidebar", size: "vertical", sortOrder: 0, startDate: "", endDate: "" });
  const [error, setError] = useState("");

  const loadAds = useCallback(async () => {
    try {
      const r = await fetch("/api/ads?all=true", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setAds(d.ads || []);
    } catch {}
  }, [token]);

  useEffect(() => { loadAds(); }, [loadAds]);

  function resetForm() {
    setForm({ title: "", imageUrl: "", linkUrl: "", placement: "sidebar", size: "vertical", sortOrder: 0, startDate: "", endDate: "" });
    setError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error || "Errore"); return; }
    setShowCreate(false);
    resetForm();
    loadAds();
  }

  async function handleUpdate(id: number) {
    setError("");
    const r = await fetch(`/api/ads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error || "Errore"); return; }
    setEditingId(null);
    resetForm();
    loadAds();
  }

  async function handleDelete(id: number) {
    if (!confirm("Eliminare questo annuncio?")) return;
    const r = await fetch(`/api/ads/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) loadAds();
  }

  function startEdit(a: any) {
    setEditingId(a.id);
    setForm({
      title: a.title || "",
      imageUrl: a.imageUrl || "",
      linkUrl: a.linkUrl || "",
      placement: a.placement || "sidebar",
      size: a.size || "vertical",
      sortOrder: a.sortOrder || 0,
      startDate: a.startDate ? a.startDate.split("T")[0] : "",
      endDate: a.endDate ? a.endDate.split("T")[0] : "",
    });
    setError("");
  }

  const placements = [
    { value: "sidebar", label: "Sidebar" },
    { value: "banner", label: "Banner" },
    { value: "inline", label: "In linea" },
    { value: "footer", label: "Footer" },
  ];

  const sizes = [
    { value: "vertical", label: "Verticale" },
    { value: "square", label: "Quadrato" },
    { value: "horizontal", label: "Orizzontale" },
    { value: "leaderboard", label: "Leaderboard" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{ads.length} annunci</p>
        <button onClick={() => { setShowCreate(true); setEditingId(null); resetForm(); }}
          className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
          <Plus size={14} /> Nuovo Annuncio
        </button>
      </div>

      {(showCreate || editingId !== null) && (
        <form onSubmit={editingId !== null ? (e) => { e.preventDefault(); handleUpdate(editingId); } : handleCreate} className="glass-card rounded-xl p-5 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{editingId !== null ? "Modifica Annuncio" : "Aggiungi Annuncio Pubblicitario"}</h4>
            <button type="button" onClick={() => { setShowCreate(false); setEditingId(null); resetForm(); }} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]"><X size={16} /></button>
          </div>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titolo *" className="input" required />
          <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL immagine banner *" className="input" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.placement} onChange={e => setForm({ ...form, placement: e.target.value })} className="select">
              {placements.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} className="select">
              {sizes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <input value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })} placeholder="URL di destinazione (opzionale)" className="input" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} type="date" placeholder="Inizio (opzionale)" className="input" />
            <input value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} type="date" placeholder="Fine (opzionale)" className="input" />
          </div>
          {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 py-2 rounded-xl text-sm">{editingId !== null ? "Salva Modifiche" : "Aggiungi Annuncio"}</button>
            <button type="button" onClick={() => { setShowCreate(false); setEditingId(null); resetForm(); }} className="px-4 py-2 rounded-xl border border-[var(--card-border)] text-sm">Annulla</button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {ads.map((a: any) => (
          <div key={a.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <img src={a.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-medium ${a.isActive ? 'text-green-500' : 'text-red-400'}`}>{a.isActive ? 'Attivo' : 'Inattivo'}</span>
                  <span>· {placements.find(p => p.value === a.placement)?.label || a.placement}</span>
                  <span>· {sizes.find(s => s.value === a.size)?.label || a.size}</span>
                  <span>· {a.clickCount || 0} click</span>
                </p>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => startEdit(a)} className="btn-ghost p-2 rounded-lg hover:text-[var(--accent)]"><Edit3 size={14} /></button>
              <button onClick={() => handleDelete(a.id)} className="btn-ghost p-2 rounded-lg hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", publisherStatus: "pending" });
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
    setForm({ name: "", email: "", password: "", role: "user", publisherStatus: "pending" });
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
    setForm({ name: u.name || "", email: u.email || "", password: "", role: u.role, publisherStatus: u.publisherStatus || "pending" });
    setError("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{users.length} utenti</p>
        <button onClick={() => { setShowCreate(true); setError(""); setForm({ name: "", email: "", password: "", role: "user", publisherStatus: "pending" }); }}
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
              <option value="publisher">Publisher</option>
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
                <option value="publisher">Publisher</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              {form.role === "publisher" && (
                <select value={form.publisherStatus} onChange={e => setForm({ ...form, publisherStatus: e.target.value })} className="select">
                  <option value="pending">In attesa</option>
                  <option value="approved">Approvato</option>
                  <option value="rejected">Rifiutato</option>
                </select>
              )}
              {u.role === "publisher" && (
                <select value={form.publisherStatus || "pending"} onChange={e => setForm({ ...form, publisherStatus: e.target.value })} className="select">
                  <option value="pending">In attesa</option>
                  <option value="approved">Approvato</option>
                  <option value="rejected">Rifiutato</option>
                </select>
              )}
              {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => handleUpdate(u.id)} className="btn-primary flex-1 py-2 rounded-xl text-sm">Salva</button>
                <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl border border-[var(--card-border)] text-sm">Annulla</button>
              </div>
            </div>
          ) : (
            <div key={u.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name || "—"}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {u.role === "publisher" && u.publisherStatus && (
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                    u.publisherStatus === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    u.publisherStatus === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {u.publisherStatus === "approved" ? "Approvato" : u.publisherStatus === "rejected" ? "Rifiutato" : "In attesa"}
                  </span>
                )}
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

function PublishersTab({ token }: { token: string }) {
  const [publishers, setPublishers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPublishers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/users?role=publisher", { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setPublishers(data.users || data || []);
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { loadPublishers(); }, [loadPublishers]);

  async function updateStatus(userId: string, status: string) {
    const r = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ publisherStatus: status }),
    });
    if (r.ok) loadPublishers();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-muted)]">Richieste publisher in attesa: {publishers.filter(p => p.publisherStatus === "pending").length}</p>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {publishers.map((p: any) => (
            <div key={p.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {p.name?.charAt(0).toUpperCase() || "P"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name || "—"}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{p.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                  p.publisherStatus === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  p.publisherStatus === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}>
                  {p.publisherStatus === "approved" ? "Approvato" : p.publisherStatus === "rejected" ? "Rifiutato" : "In attesa"}
                </span>
                {p.publisherStatus === "pending" && (
                  <>
                    <button onClick={() => updateStatus(p.id, "approved")} className="btn-ghost p-2 rounded-lg hover:text-green-500" title="Approva"><CheckCircle size={16} /></button>
                    <button onClick={() => updateStatus(p.id, "rejected")} className="btn-ghost p-2 rounded-lg hover:text-red-500" title="Rifiuta"><XCircle size={16} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
          {publishers.length === 0 && <p className="text-center text-[var(--text-muted)] py-8">Nessun publisher registrato</p>}
        </div>
      )}
    </div>
  );
}
