"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Bookmark, Trash2, Edit3, Check, X, Globe, MessageCircle, MessageSquare, Link, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [event, setEvent] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((data) => { setEvent(data); setIsSaved(data.is_saved || false); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleSave() {
    if (!user) return router.push("/login");
    const method = isSaved ? "DELETE" : "POST";
    const res = await fetch(`/api/events/${id}/save`, { method, headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setIsSaved(!isSaved);
  }

  async function handleDelete() {
    if (!confirm("Eliminare questo evento?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    router.push("/events");
  }

  function shareUrl(platform: string) {
    const url = window.location.href;
    const text = `${event?.title} - EventiNLatina`;
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    };
    if (platform === "copy") { navigator.clipboard.writeText(url); return; }
    window.open(shareUrls[platform], "_blank");
  }

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Caricamento...</p>
      </div>
    </div>
  );
  if (!event) return (
    <div className="text-center py-24">
      <p className="text-lg font-medium text-[var(--text-primary)]">Evento non trovato</p>
      <p className="text-sm text-[var(--text-muted)] mt-1">L&apos;evento che cerchi non esiste o è stato rimosso</p>
    </div>
  );

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="page-container max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-4 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Indietro
      </button>

      {event.image_url && (
        <div className="relative rounded-2xl overflow-hidden mb-6 h-56 sm:h-72 lg:h-80">
          <img src={event.image_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            {event.category_color && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.category_color }} />
                {event.category_name}
              </span>
            )}
          </div>
          {event.is_new && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
                <Sparkles size={12} /> Nuovo
              </span>
            </div>
          )}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            {!event.image_url && event.category_color && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: event.category_color + "15", color: event.category_color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.category_color }} />
                {event.category_name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{event.title}</h1>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={toggleSave} className={`p-2.5 rounded-xl border transition-all ${isSaved ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]" : "border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)]"}`}>
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <div className="relative">
              <button onClick={() => setShowShare(!showShare)} onBlur={() => setTimeout(() => setShowShare(false), 200)}
                className="p-2.5 rounded-xl border border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] transition-all">
                <Share2 size={18} />
              </button>
              {showShare && (
                <div className="absolute right-0 top-full mt-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-1.5 shadow-xl flex gap-1 z-10 animate-scale-in">
                  <button onClick={() => shareUrl("facebook")} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><MessageSquare size={16} className="text-blue-600" /></button>
                  <button onClick={() => shareUrl("twitter")} className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><MessageCircle size={16} className="text-sky-500" /></button>
                  <button onClick={() => shareUrl("whatsapp")} className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"><Link size={16} className="text-green-600" /></button>
                  <div className="w-px bg-[var(--card-border)] mx-0.5" />
                  <button onClick={() => shareUrl("copy")} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs font-medium px-2 transition-colors">Copia</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-subtle)] to-transparent">
            <Calendar size={15} className="text-[var(--accent)]" />
            <span className="text-[var(--text-secondary)]">{new Date(event.date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{event.endDate ? ` - ${new Date(event.endDate).toLocaleDateString("it-IT")}` : ""}</span>
          </div>
          {event.time && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-subtle)] to-transparent">
              <Clock size={15} className="text-[var(--accent)]" />
              <span className="text-[var(--text-secondary)]">{event.time}</span>
            </div>
          )}
          {event.city && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-subtle)] to-transparent">
              <MapPin size={15} className="text-[var(--accent)]" />
              <span className="text-[var(--text-secondary)]">{event.city} {event.province && `(${event.province})`}</span>
            </div>
          )}
        </div>

        {event.location && <div className="divider" />}
        {event.location && (
          <p className="text-sm"><span className="font-semibold">📍 Luogo:</span> <span className="text-[var(--text-secondary)]">{event.location}{event.address ? ` — ${event.address}` : ""}</span></p>
        )}

        {event.description && (
          <>
            <div className="divider" />
            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{event.description}</p>
          </>
        )}

        {event.price && (
          <p className="text-sm"><span className="font-semibold">💰 Prezzo:</span> <span className="text-[var(--text-secondary)]">{event.price}</span></p>
        )}

        {(event.source_url || event.source_name) && (
          <>
            <div className="divider" />
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 dark:to-transparent border border-amber-200/50 dark:border-amber-800/30">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Globe size={16} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[var(--text-secondary)]">Fonte</p>
                {event.source_url ? (
                  <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] hover:underline underline-offset-2 break-all block leading-tight font-medium">
                    {event.source_name || event.source_url}
                  </a>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">{event.source_name}</p>
                )}
              </div>
              {event.source_url && (
                <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="btn-ghost p-2 rounded-lg flex-shrink-0">
                  <Link size={16} />
                </a>
              )}
            </div>
          </>
        )}

        {isAdmin && !editing && (
          <>
            <div className="divider" />
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--card-border)] text-xs font-medium hover:bg-[var(--accent-subtle)] hover:border-[var(--accent)] transition-all">
                <Edit3 size={14} /> Modifica
              </button>
              <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-500 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <Trash2 size={14} /> Elimina
              </button>
            </div>
          </>
        )}
      </div>

      {isAdmin && editing && (
        <EditForm event={event} onClose={() => setEditing(false)} onSaved={(e) => { setEvent(e); setEditing(false); }} token={token!} />
      )}
    </div>
  );
}

function EditForm({ event, onClose, onSaved, token }: { event: any; onClose: () => void; onSaved: (e: any) => void; token: string }) {
  const [form, setForm] = useState({ title: event.title, description: event.description || "", category_id: event.category_id || "", date: event.date?.split("T")[0] || "", time: event.time || "", location: event.location || "", city: event.city || "", province: event.province || "", image_url: event.image_url || "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    const res = await fetch(`/api/events/${event.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Errore"); return; }
    onSaved(data);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 mt-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2"><Edit3 size={18} /> Modifica Evento</h3>
        <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"><X size={18} /></button>
      </div>
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titolo" className="input" required />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrizione" rows={4} className="input resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input" />
      </div>
      <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Luogo" className="input" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Città" className="input" />
        <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Provincia (es. LT)" className="input" />
      </div>
      <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL immagine" className="input" />
      {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5">{error}</p>}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5"><Check size={16} /> {saving ? "Salvataggio..." : "Salva"}</button>
        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--card-border)] text-sm font-medium hover:bg-[var(--bg-secondary)] transition-all">Annulla</button>
      </div>
    </form>
  );
}
