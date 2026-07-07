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
      <button onClick={() => setOpen(true)} className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] md:hidden">
        <Menu size={20} />
      </button>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[var(--card-bg)] border-r border-[var(--card-border)] z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-[var(--card-border)]">
          <Link href="/dashboard" className="text-xl font-bold text-gradient">EventiNLatina</Link>
          <button onClick={() => setOpen(false)} className="p-1 md:hidden"><X size={18} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? "bg-[var(--accent)] text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"}`}>
                <l.icon size={18} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[var(--card-border)]">
          {user && (
            <button onClick={() => { logout(); window.location.href = "/login"; }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 w-full transition-all">
              <LogOut size={18} /> Esci
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
