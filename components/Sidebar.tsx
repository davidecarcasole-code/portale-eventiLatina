"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Radio, Bookmark, User, Shield, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/events", label: "Eventi", icon: Calendar },
    { href: "/radio", label: "Web Radio", icon: Radio },
    { href: "/saved", label: "Salvati", icon: Bookmark },
    { href: "/profile", label: "Profilo", icon: User },
    ...(user?.role === "admin" || user?.role === "super_admin" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed top-3 left-3 z-50 p-2.5 rounded-xl glass md:hidden">
        <Menu size={20} />
      </button>
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-[var(--sidebar-width)] bg-[var(--card-bg)] border-r border-[var(--card-border)] z-50 transform transition-all duration-300 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}>
        <div className="p-5 flex items-center gap-3 border-b border-[var(--card-border)]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl ring-2 ring-[var(--accent)]/20 group-hover:ring-[var(--accent)]/40 transition-all" />
            <div>
              <span className="text-lg font-bold text-gradient block leading-tight">EventiNLatina</span>
              <span className="text-[10px] text-[var(--text-muted)]">Provincia di Latina</span>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] md:hidden ml-auto"><X size={16} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]" : "text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]"}`}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        {user && (
          <div className="p-3 border-t border-[var(--card-border)]">
            <button onClick={() => { logout(); window.location.href = "/login"; }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 w-full transition-all duration-200">
              <LogOut size={18} strokeWidth={1.5} /> Esci
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
