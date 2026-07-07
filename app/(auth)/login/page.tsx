"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LogIn, UserPlus, Mail, Lock, User, Globe } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">EventiNLatina</h1>
          <p className="text-[var(--text-secondary)] mt-2">Eventi, spettacoli e cultura in provincia di Latina</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 shadow-lg">
          <div className="flex mb-6 bg-[var(--bg-secondary)] rounded-lg p-1">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? "bg-white dark:bg-gray-800 shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
              <LogIn size={16} className="inline mr-1" /> Accedi
            </button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? "bg-white dark:bg-gray-800 shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
              <UserPlus size={16} className="inline mr-1" /> Registrati
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-1 block"><User size={14} className="inline mr-1" />Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm" placeholder="Il tuo nome" required />
              </div>
            )}
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1 block"><Mail size={14} className="inline mr-1" />Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm" placeholder="tua@email.com" required />
            </div>
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1 block"><Lock size={14} className="inline mr-1" />Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm" placeholder="••••••••" required minLength={6} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2.5 btn-festive text-white rounded-lg font-medium text-sm disabled:opacity-50">
              {loading ? "Attendere..." : isLogin ? "Accedi" : "Registrati"}
            </button>
          </form>
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--card-border)]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[var(--card-bg)] px-2 text-[var(--text-secondary)]">oppure</span></div>
          </div>
          <button onClick={handleGoogle} className="w-full mt-4 py-2.5 rounded-lg border border-[var(--card-border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center gap-2">
            <Globe size={18} /> Continua con Google
          </button>
        </div>
      </div>
    </div>
  );
}
