"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LogIn, UserPlus, Mail, Lock, User } from "lucide-react";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1920&q=80",
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
  "https://images.unsplash.com/photo-1719734622048-dc5a15197437?w=1920&q=80",
  "https://images.unsplash.com/photo-1760111102591-c6390c8a652d?w=1920&q=80",
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
    <div className="min-h-screen flex relative overflow-hidden bg-black">
      {BG_IMAGES.map((src, i) => (
        <div key={src} className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === bgIdx ? 1 : 0 }}>
          <img src={src} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "blur(6px) brightness(0.4)" }} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl animate-fade-in flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <img src="/banner.png" alt="EventiNLatina" className="w-full max-w-sm mx-auto lg:mx-0 rounded-3xl shadow-2xl ring-2 ring-white/20 mb-6" />
            <p className="text-white/70 text-base lg:text-lg max-w-sm mx-auto lg:mx-0 leading-relaxed">
              Scopri eventi, sagre, concerti, mostre e manifestazioni in provincia di Latina e nel Lazio.
            </p>
            <div className="flex gap-2 justify-center lg:justify-start mt-5 flex-wrap">
              {["Musica", "Teatro", "Sagre", "Natura", "Cultura"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium backdrop-blur-sm border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-2 justify-center lg:justify-start mt-8">
              {BG_IMAGES.map((_, i) => (
                <button key={i} onClick={() => setBgIdx(i)}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: i === bgIdx ? 24 : 8, backgroundColor: i === bgIdx ? "#06b6d4" : "rgba(255,255,255,0.3)" }} />
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm">
            <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl">
              <div className="flex mb-6 bg-white/10 rounded-xl p-1">
                <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? "bg-white/20 shadow-sm text-white" : "text-white/60 hover:text-white"}`}>
                  <LogIn size={16} className="inline mr-1.5" /> Accedi
                </button>
                <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? "bg-white/20 shadow-sm text-white" : "text-white/60 hover:text-white"}`}>
                  <UserPlus size={16} className="inline mr-1.5" /> Registrati
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="text-xs font-medium text-white/70 mb-1.5 block"><User size={13} className="inline mr-1" /> Nome</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all" placeholder="Il tuo nome" required />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-white/70 mb-1.5 block"><Mail size={13} className="inline mr-1" /> Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all" placeholder="tua@email.com" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/70 mb-1.5 block"><Lock size={13} className="inline mr-1" /> Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all" placeholder="••••••••" required minLength={6} />
                </div>
                {error && <p className="text-red-400 text-sm bg-red-950/40 rounded-lg p-2.5">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-600 hover:to-indigo-600 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20">
                  {loading ? "Attendere..." : isLogin ? "Accedi" : "Crea Account"}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-white/40 mt-6">
              &copy; {new Date().getFullYear()} EventiNLatina
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
