"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { Sparkles } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { InstagramIcon, FacebookIcon, YoutubeIcon, TikTokIcon } from "./SocialIcons";

const socialLinks = [
  { href: "https://www.instagram.com/eventinlatina/", icon: InstagramIcon, color: "hover:text-pink-500", label: "Instagram" },
  { href: "https://www.facebook.com/eventinlatina", icon: FacebookIcon, color: "hover:text-blue-600", label: "Facebook" },
  { href: "https://www.youtube.com/@eventinlatina", icon: YoutubeIcon, color: "hover:text-red-600", label: "YouTube" },
  { href: "https://www.tiktok.com/@eventinlatina", icon: TikTokIcon, color: "hover:text-purple-500", label: "TikTok" },
];

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
        <div className="hidden lg:flex items-center gap-0.5">
          {socialLinks.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] ${s.color} hover:bg-[var(--accent-subtle)] transition-all`} title={s.label}>
              <s.icon size={15} />
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <NotificationBell />
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
