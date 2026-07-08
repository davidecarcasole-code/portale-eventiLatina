"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LogIn, UserPlus, Mail, Lock, User, Globe, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { email, password } : { email, password, name };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setAuth(data.user, data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("Login Google non configurato");
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-600 via-amber-700 to-yellow-800">
        <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)" }} />
        <div className="blur-sphere" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(255,255,255,0.1), transparent)", filter: "blur(100px)", top: "-150px", right: "-150px" }} />
        <div className="blur-sphere" style={{ width: 350, height: 350, background: "radial-gradient(circle, rgba(251,191,36,0.08), transparent)", filter: "blur(80px)", bottom: "-80px", left: "-80px" }} />
        <div className="absolute top-8 right-12 w-3 h-3 bg-yellow-300 rounded-full animate-float-up opacity-60" />
        <div className="absolute top-20 left-16 w-2 h-2 bg-white/40 rounded animate-float-up" style={{ animationDelay: "0.7s" }} />
        <div className="absolute bottom-32 right-24 w-2.5 h-2.5 bg-orange-200 rounded animate-float-up" style={{ animationDelay: "1.2s" }} />
        <div className="absolute bottom-40 left-20 w-2 h-2 bg-amber-200 rotate-45 animate-float-up" style={{ animationDelay: "0.4s" }} />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-sm">
            <img src="/banner.png" alt="" className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl ring-1 ring-white/10" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-2xl ring-4 ring-white/20 shadow-xl" />
            <div>
              <h1 className="text-3xl font-bold text-white">EventiNLatina</h1>
              <p className="text-white/70 text-sm">Eventi, spettacoli e cultura</p>
            </div>
          </div>
          <p className="text-white/60 text-sm max-w-md leading-relaxed">
            Scopri tutti gli eventi, sagre, concerti, mostre e manifestazioni in provincia di Latina e nel Lazio. Il calendario completo degli eventi del territorio.
          </p>
          <div className="flex gap-6 mt-6">
            {["Musica", "Teatro", "Sagre", "Natura"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm border border-white/10">
                {tag}
              </span>
            ))}
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
            <button onClick={handleGoogle} className="w-full mt-4 py-2.5 rounded-xl border border-[var(--card-border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all flex items-center justify-center gap-2.5 btn-ghost">
              <Globe size={18} /> Continua con Google
            </button>
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            &copy; {new Date().getFullYear()} EventiNLatina — Tutti gli eventi della provincia di Latina
          </p>
        </div>
      </div>
    </div>
  );
}
