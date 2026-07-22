"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Bookmark, Trash2, Edit3, Check, X, Globe, Link as LinkIcon, Sparkles, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { AdBanner } from "@/components/AdBanner";

export default function EventDetailClient({ initialEvent, slug }: { initialEvent: any; slug: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [event, setEvent] = useState<any>(initialEvent);
  const [isSaved, setIsSaved] = useState(initialEvent?.is_saved || false);
  const [editing, setEditing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!initialEvent) return;
    fetch(`/api/events/${slug}/view`, { method: "POST" }).catch(() => {});
    if (initialEvent.category_slug) {
      const today = new Date().toISOString().split('T')[0];
      const to = new Date(initialEvent.date);
      to.setDate(to.getDate() + 14);
      fetch(`/api/events?category=${initialEvent.category_slug}&dateFrom=${today}&dateTo=${to.toISOString().split('T')[0]}&limit=6`)
        .then(r => r.json())
        .then(d => setRelated((d.events || []).filter((e: any) => e.id !== initialEvent.id)))
        .catch(() => {});
    }
  }, [initialEvent, slug]);

  async function toggleSave() {
    if (!user) return router.push("/login");
    const method = isSaved ? "DELETE" : "POST";
    const res = await fetch(`/api/events/${event.id}/save`, { method, headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setIsSaved(!isSaved);
  }

  async function handleDelete() {
    if (!confirm("Eliminare questo evento?")) return;
    await fetch(`/api/events/${event.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    router.push("/events");
  }

  function shareUrl(platform: string) {
    const url = window.location.href;
    const text = `${event?.title} - EventiNLatina`;
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`,
      messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&redirect_uri=${encodeURIComponent(url)}&app_id=`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      instagram: `https://www.instagram.com/`,
    };
    if (platform === "copy") { navigator.clipboard.writeText(url); return; }
    if (platform === "instagram") { navigator.clipboard.writeText(url); alert("Link copiato! Incollalo su Instagram."); return; }
    window.open(shareUrls[platform], "_blank", "noopener,noreferrer,width=600,height=600");
  }

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
        <div className="relative rounded-2xl overflow-hidden mb-6 h-56 sm:h-72 lg:h-80 cursor-pointer" onClick={() => setShowImage(true)}>
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
                  <button onClick={() => shareUrl("facebook")} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
                  <button onClick={() => shareUrl("messenger")} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0084FF]"><path d="M12 0C5.373 0 0 5.373 0 12c0 3.467 1.47 6.59 3.82 8.79l-.534 2.805 3.075-1.65A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.74 0-3.38-.39-4.85-1.08l-3.39 1.81.6-3.15A9.478 9.478 0 012.4 12c0-5.3 4.3-9.6 9.6-9.6s9.6 4.3 9.6 9.6-4.3 9.6-9.6 9.6zm5.52-7.08l-4.68-2.52-2.16 2.88 4.92-3.6-5.64.6-1.08 2.64h3.6l2.04 3.6 3.72-3.24z"/></svg></button>
                  <button onClick={() => shareUrl("whatsapp")} className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
                  <button onClick={() => shareUrl("instagram")} className="p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#E4405F]"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></button>
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
          <p className="text-sm"><span className="font-semibold">Luogo:</span> <span className="text-[var(--text-secondary)]">{event.location}{event.address ? ` — ${event.address}` : ""}</span></p>
        )}

        {event.description && (
          <>
            <div className="divider" />
            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{event.description}</p>
          </>
        )}
        {event.image_url && (
          <div className="mt-4">
            <img
              src={event.image_url}
              alt=""
              className="w-full rounded-xl cursor-pointer object-cover max-h-96 border border-[var(--card-border)]"
              onClick={() => setShowImage(true)}
            />
          </div>
        )}

        {event.price && (
          <p className="text-sm"><span className="font-semibold">Prezzo:</span> <span className="text-[var(--text-secondary)]">{event.price}</span></p>
        )}

        {(event.source_url || event.source_name) && (
          <>
            <div className="divider" />
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-50 to-transparent dark:from-cyan-900/10 dark:to-transparent border border-cyan-200/50 dark:border-cyan-800/30">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
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
                  <LinkIcon size={16} />
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

      <div className="flex justify-center mt-6">
        <AdBanner placement="inline" />
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Potrebbero interessarti</h3>
            <Link href={`/events?category=${event.category_slug}`} className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-medium">
              Vedi tutti <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((e: any) => (
              <Link key={e.id} href={`/events/${e.slug || e.id}`} className="glass-card rounded-xl p-4 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 group">
                <div className="flex items-start gap-3">
                  {e.image_url && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={e.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {e.category_color && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: e.category_color + "20", color: e.category_color }}>
                        {e.category_name}
                      </span>
                    )}
                    <h4 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors mt-1">{e.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{new Date(e.date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                      {e.time && <span className="flex items-center gap-1"><Clock size={11} />{e.time}</span>}
                      {e.city && <span className="flex items-center gap-1"><MapPin size={11} />{e.city}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isAdmin && editing && (
        <EditForm event={event} onClose={() => setEditing(false)} onSaved={(e) => { setEvent(e); setEditing(false); }} token={token!} />
      )}

      {showImage && event.image_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowImage(false)}>
          <button onClick={() => setShowImage(false)} className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-10">
            <X size={24} />
          </button>
          <img src={event.image_url} alt="" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
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
