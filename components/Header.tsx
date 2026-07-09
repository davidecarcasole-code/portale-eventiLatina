"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { Bell, Sparkles } from "lucide-react";

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--card-border)]">
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5" style={{ minHeight: "var(--header-height)" }}>
        <Link href="/dashboard" className="md:hidden flex items-center gap-2">
          <div className="relative">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg ring-2 ring-[var(--accent)]/20" />
            <Sparkles size={8} className="absolute -top-0.5 -right-0.5 text-cyan-400 animate-pulse" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-300 bg-clip-text text-transparent">EventiNLatina</span>
        </Link>
        <div className="md:hidden" />
        <div className="flex items-center gap-2 ml-auto">
          <button className="btn-ghost p-2 rounded-xl relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>
          {user && (
            <Link href="/profile" className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--accent-subtle)] transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 ring-[var(--accent)]/20">
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">{user.name}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
