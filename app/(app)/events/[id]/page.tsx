"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Bookmark, Trash2, Edit3, Check, X, Globe, Link, MessageCircle, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [event, setEvent] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" /></div>;
  if (!event) return <div className="text-center py-12 text-[var(--text-secondary)]">Evento non trovato</div>;

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
        <ArrowLeft size={16} /> Indietro
      </button>

      {event.image_url && <img src={event.image_url} alt="" className="w-full h-64 object-cover rounded-xl" />}

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            {event.category_color && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: event.category_color + "20", color: event.category_color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.category_color }} />
                {event.category_name}
              </span>
            )}
            <h1 className="text-2xl font-bold mt-2">{event.title}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleSave} className={`p-2 rounded-lg border ${isSaved ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--card-border)] text-[var(--text-secondary)]"}`}>
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <div className="relative group">
              <button className="p-2 rounded-lg border border-[var(--card-border)] text-[var(--text-secondary)]"><Share2 size={18} /></button>
              <div className="absolute right-0 top-full mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-1 shadow-lg hidden group-hover:flex gap-1 z-10">
                <button onClick={() => shareUrl("facebook")} className="p-2 rounded hover:bg-blue-50 share-btn-fb"><MessageSquare size={16} /></button>
                <button onClick={() => shareUrl("twitter")} className="p-2 rounded hover:bg-gray-50 share-btn-tw"><MessageCircle size={16} /></button>
                <button onClick={() => shareUrl("whatsapp")} className="p-2 rounded hover:bg-green-50 share-btn-wa"><Link size={16} /></button>
                <button onClick={() => shareUrl("copy")} className="p-2 rounded hover:bg-gray-50 text-[var(--text-secondary)] text-xs font-medium px-2">Copia</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5"><Calendar size={15} />{new Date(event.date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{event.endDate ? ` - ${new Date(event.endDate).toLocaleDateString("it-IT")}` : ""}</span>
          {event.time && <span className="flex items-center gap-1.5"><Clock size={15} />{event.time}</span>}
          {event.city && <span className="flex items-center gap-1.5"><MapPin size={15} />{event.city} {event.province && `(${event.province})`}</span>}
        </div>

        {event.location && <p className="text-sm"><span className="font-medium">Luogo:</span> {event.location}{event.address ? ` - ${event.address}` : ""}</p>}

        {event.description && <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{event.description}</p>}

        {event.price && <p className="text-sm"><span className="font-medium">Prezzo:</span> {event.price}</p>}

        {(event.source_url || event.source_name) && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Globe size={12} />
            {event.source_url ? <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] underline">Fonte: {event.source_name || event.source_url}</a> : <span>Fonte: {event.source_name}</span>}
          </div>
        )}

        {isAdmin && !editing && (
          <div className="flex gap-2 pt-2 border-t border-[var(--card-border)]">
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-xs hover:bg-[var(--bg-secondary)]"><Edit3 size={14} /> Modifica</button>
            <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50"><Trash2 size={14} /> Elimina</button>
          </div>
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/events/${event.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Errore"); return; }
    onSaved(data);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Modifica Evento</h3>
        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-secondary)]"><X size={18} /></button>
      </div>
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titolo" className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm" required />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrizione" rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm" />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm" />
        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm" />
      </div>
      <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Luogo" className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Città" className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm" />
        <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Provincia" className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm" />
      </div>
      <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL immagine" className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-2 btn-festive text-white rounded-lg text-sm font-medium"><Check size={16} className="inline mr-1" /> Salva</button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-sm">Annulla</button>
      </div>
    </form>
  );
}
