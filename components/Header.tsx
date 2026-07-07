"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { Bell } from "lucide-react";

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--card-border)]">
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5" style={{ minHeight: "var(--header-height)" }}>
        <Link href="/dashboard" className="md:hidden flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg ring-2 ring-[var(--accent)]/20" />
          <span className="text-sm font-bold text-gradient">EventiNLatina</span>
        </Link>
        <div className="md:hidden" />
        <div className="flex items-center gap-2 ml-auto">
          <button className="btn-ghost p-2 rounded-xl">
            <Bell size={18} />
          </button>
          {user && (
            <Link href="/profile" className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--accent-subtle)] transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-amber-400 flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 ring-[var(--accent)]/20">
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
