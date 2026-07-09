"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LogIn, UserPlus, Mail, Lock, User, Globe } from "lucide-react";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1920&q=80",
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
  "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1920&q=80",
  "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=1920&q=80",
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bgIdx, setBgIdx] = useState(0);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => setBgIdx((i) => (i + 1) % BG_IMAGES.length), 20000);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { email, password } : { email, password, name };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setAuth(data.user, data.token);
      router.push("/dashboard");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        {BG_IMAGES.map((src, i) => (
          <div key={src} className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === bgIdx ? 1 : 0 }}>
            <img src={src} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "blur(4px) brightness(0.5)" }} />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="text-center max-w-md">
            <img src="/banner.png" alt="" className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl ring-2 ring-white/20" />
            <p className="text-white/80 text-lg mt-4 font-light">Scopri tutti gli eventi della provincia di Latina</p>
            <div className="flex gap-3 justify-center mt-4">
              {["Musica", "Teatro", "Sagre", "Natura"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs font-medium backdrop-blur-sm border border-white/20">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-2 h-2 rounded-full transition-all duration-700" style={{ backgroundColor: bgIdx === 0 ? "#f59e0b" : "rgba(255,255,255,0.3)" }} />
              <div className="w-2 h-2 rounded-full transition-all duration-700" style={{ backgroundColor: bgIdx === 1 ? "#f59e0b" : "rgba(255,255,255,0.3)" }} />
              <div className="w-2 h-2 rounded-full transition-all duration-700" style={{ backgroundColor: bgIdx === 2 ? "#f59e0b" : "rgba(255,255,255,0.3)" }} />
              <div className="w-2 h-2 rounded-full transition-all duration-700" style={{ backgroundColor: bgIdx === 3 ? "#f59e0b" : "rgba(255,255,255,0.3)" }} />
              <div className="w-2 h-2 rounded-full transition-all duration-700" style={{ backgroundColor: bgIdx === 4 ? "#f59e0b" : "rgba(255,255,255,0.3)" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-[#2a2725] dark:via-[#2a2725] dark:to-[#2a2725] relative">
        <div className="blur-sphere" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(249,115,22,0.08), transparent)", filter: "blur(70px)", top: "10%", right: "-50px" }} />
        <div className="blur-sphere" style={{ width: 250, height: 250, background: "radial-gradient(circle, rgba(251,191,36,0.06), transparent)", filter: "blur(60px)", bottom: "5%", left: "-30px" }} />
        <div className="w-full max-w-sm animate-fade-in relative z-10">
          <div className="text-center mb-8 lg:hidden">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-3 rounded-2xl ring-4 ring-[var(--accent)]/20 shadow-lg" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent">EventiNLatina</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Eventi, spettacoli e cultura in provincia di Latina</p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex mb-6 bg-[var(--bg-secondary)] rounded-xl p-1">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? "bg-white dark:bg-[var(--card-bg)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                <LogIn size={16} className="inline mr-1.5" /> Accedi
              </button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? "bg-white dark:bg-[var(--card-bg)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                <UserPlus size={16} className="inline mr-1.5" /> Registrati
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block"><User size={13} className="inline mr-1" /> Nome</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Il tuo nome" required />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block"><Mail size={13} className="inline mr-1" /> Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="tua@email.com" required />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block"><Lock size={13} className="inline mr-1" /> Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 rounded-lg p-2.5">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 rounded-xl text-sm disabled:opacity-50">
                {loading ? "Attendere..." : isLogin ? "Accedi" : "Crea Account"}
              </button>
            </form>

            <div className="mt-5 relative">
              <div className="absolute inset-0 flex items-center"><div className="divider" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-[var(--card-bg)] px-3 text-[var(--text-muted)]">oppure</span></div>
            </div>
            <button onClick={() => setError("Login Google non configurato")} className="w-full mt-4 py-2.5 rounded-xl border border-[var(--card-border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all flex items-center justify-center gap-2.5 btn-ghost">
              <Globe size={18} /> Continua con Google
            </button>
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            &copy; {new Date().getFullYear()} EventiNLatina
          </p>
        </div>
      </div>
    </div>
  );
}
