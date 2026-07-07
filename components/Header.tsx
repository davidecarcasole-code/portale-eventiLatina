"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { Bell } from "lucide-react";

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--card-border)]">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="md:hidden" />
        <div className="flex items-center gap-3 ml-auto">
          <button className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
            <Bell size={18} />
          </button>
          {user && (
            <Link href="/profile" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-amber-400 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm text-[var(--text-primary)] hidden sm:block">{user.name}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
