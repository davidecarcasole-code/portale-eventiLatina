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
    <div className="min-h-screen flex relative overflow-hidden bg-black">
      {BG_IMAGES.map((src, i) => (
        <div key={src} className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === bgIdx ? 1 : 0 }}>
          <img src={src} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "blur(6px) brightness(0.45)" }} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-6">
            <img src="/banner.png" alt="" className="w-full max-w-xs mx-auto rounded-2xl shadow-2xl ring-2 ring-white/20" />
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8 bg-black/40 backdrop-blur-xl border-white/10">
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
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input bg-white/10 border-white/20 text-white placeholder:text-white/40" placeholder="Il tuo nome" required />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-white/70 mb-1.5 block"><Mail size={13} className="inline mr-1" /> Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input bg-white/10 border-white/20 text-white placeholder:text-white/40" placeholder="tua@email.com" required />
              </div>
              <div>
                <label className="text-xs font-medium text-white/70 mb-1.5 block"><Lock size={13} className="inline mr-1" /> Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input bg-white/10 border-white/20 text-white placeholder:text-white/40" placeholder="••••••••" required minLength={6} />
              </div>
              {error && <p className="text-red-400 text-sm bg-red-950/40 rounded-lg p-2.5">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all">
                {loading ? "Attendere..." : isLogin ? "Accedi" : "Crea Account"}
              </button>
            </form>

            <div className="mt-5 relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-black/40 px-3 text-white/50">oppure</span></div>
            </div>
            <button onClick={() => setError("Login Google non configurato")} className="w-full mt-4 py-2.5 rounded-xl border border-white/20 text-sm font-medium text-white/80 hover:bg-white/10 transition-all flex items-center justify-center gap-2.5">
              <Globe size={18} /> Continua con Google
            </button>
          </div>

          <p className="text-center text-xs text-white/40 mt-6">
            &copy; {new Date().getFullYear()} EventiNLatina
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
        {BG_IMAGES.map((_, i) => (
          <button key={i} onClick={() => setBgIdx(i)}
            className="w-2 h-2 rounded-full transition-all duration-500"
            style={{ backgroundColor: i === bgIdx ? "#f59e0b" : "rgba(255,255,255,0.3)" }} />
        ))}
      </div>
    </div>
  );
}
