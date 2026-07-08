"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Camera, LogOut, Sun, Moon, Monitor, Palette } from "lucide-react";

const ACCENT_COLORS = ["#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#84cc16"];

function compressImage(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ProfilePage() {
  const { user, updateUser, logout, token } = useAuthStore();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function saveName() {
    setSaving(true);
    await fetch("/api/users/me", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name }) });
    updateUser({ name });
    setSaving(false);
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    setUploading(true);
    try {
      const compressed = await compressImage(file, 256, 0.7);
      const res = await fetch("/api/users/avatar", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ dataUrl: compressed }) });
      const data = await res.json();
      if (!res.ok) { setAvatarError(data.error || "Errore"); return; }
      updateUser({ avatar: data.avatar });
    } catch {
      setAvatarError("Errore durante la compressione");
    } finally {
      setUploading(false);
    }
  }

  async function setTheme(theme: string) {
    await fetch("/api/users/me", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ theme }) });
    updateUser({ theme });
  }

  async function setAccent(color: string) {
    await fetch("/api/users/me", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ accent_color: color }) });
    updateUser({ accent_color: color });
    document.documentElement.style.setProperty("--accent", color);
  }

  useEffect(() => { if (!user) router.push("/login"); }, [user]);

  function handleLogout() { logout(); router.push("/login"); }

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent)] to-amber-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden mx-auto ring-2 ring-[var(--accent)]/20">
            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </div>
        {uploading && <p className="text-xs text-[var(--text-muted)] mt-2">Caricamento...</p>}
        {avatarError && <p className="text-red-500 text-xs mt-2">{avatarError}</p>}
        <p className="text-sm text-[var(--text-secondary)] mt-2">{user.email}</p>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${user.role === "super_admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-[var(--accent-subtle)] text-[var(--accent)]"}`}>
          {user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : "Utente"}
        </span>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-sm">Profilo</h3>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-sm" />
          <button onClick={saveName} disabled={saving} className="px-4 py-2 btn-primary text-white rounded-lg text-sm">{saving ? "..." : "Salva"}</button>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-sm">Tema</h3>
        <div className="flex gap-2">
          {[
            { key: "system", icon: Monitor, label: "Sistema" },
            { key: "light", icon: Sun, label: "Chiaro" },
            { key: "dark", icon: Moon, label: "Scuro" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTheme(t.key)}
              className={`flex-1 py-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 ${(user.theme || "system") === t.key ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--card-border)] text-[var(--text-secondary)]"}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-sm"><Palette size={14} className="inline mr-1" /> Colore Accento</h3>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map((c) => (
            <button key={c} onClick={() => setAccent(c)}
              className={`w-8 h-8 rounded-full transition-transform ${(user.accent_color || "#f97316") === c ? "ring-2 ring-offset-2 ring-[var(--accent)] scale-110 animate-pulse-neon" : "hover:scale-110"}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <button onClick={handleLogout} className="w-full py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center gap-2 transition-all">
        <LogOut size={16} /> Esci
      </button>
    </div>
  );
}
