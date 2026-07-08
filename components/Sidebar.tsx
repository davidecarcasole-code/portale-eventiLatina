"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Radio, Bookmark, User, Shield, LogOut, Menu, X, Sparkles } from "lucide-react";
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
      {open && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" onClick={() => setOpen(false)} />}
      {open && (
        <aside className="fixed md:hidden inset-y-0 left-0 z-50 w-[var(--sidebar-width)] bg-[var(--card-bg)]/95 backdrop-blur-xl border-r border-[var(--card-border)] flex flex-col animate-fade-in">
          <SidebarContent links={links} pathname={pathname} user={user} logout={logout} onClose={() => setOpen(false)} showClose />
        </aside>
      )}
      <aside className="hidden md:flex md:sticky top-0 h-screen w-[var(--sidebar-width)] bg-[var(--card-bg)]/95 backdrop-blur-xl border-r border-[var(--card-border)] flex-col">
        <SidebarContent links={links} pathname={pathname} user={user} logout={logout} onClose={() => setOpen(false)} />
      </aside>
    </>
  );
}

function SidebarContent({ links, pathname, user, logout, onClose, showClose }: {
  links: { href: string; label: string; icon: any }[];
  pathname: string;
  user: any;
  logout: () => void;
  onClose: () => void;
  showClose?: boolean;
}) {
  return (
    <>
      <div className="p-5 flex items-center gap-3 border-b border-[var(--card-border)]">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3 group">
          <div className="relative">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl ring-2 ring-[var(--accent)]/20 group-hover:ring-[var(--accent)]/40 transition-all" />
            <Sparkles size={10} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent leading-tight block">EventiNLatina</span>
            <span className="text-[10px] text-[var(--text-muted)]">Provincia di Latina</span>
          </div>
        </Link>
        {showClose && <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] ml-auto"><X size={16} /></button>}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-gradient-to-r from-[var(--accent)] to-amber-500 text-white shadow-lg shadow-[var(--accent-glow)]" : "text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]"}`}>
              <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="p-3 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-gradient-to-r from-[var(--accent-subtle)] to-transparent">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
              {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)] truncate">{user.name || user.email}</span>
          </div>
          <button onClick={() => { logout(); window.location.href = "/login"; }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 w-full transition-all duration-200">
            <LogOut size={18} strokeWidth={1.5} /> Esci
          </button>
        </div>
      )}
    </>
  );
}
