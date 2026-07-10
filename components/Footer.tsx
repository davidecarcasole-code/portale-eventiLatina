"use client";

import Link from "next/link";
import { InstagramIcon, FacebookIcon, YoutubeIcon, TikTokIcon } from "./SocialIcons";

export function Footer() {
  const socials = [
    { href: "https://www.instagram.com/eventinlatina/", icon: InstagramIcon, label: "Instagram" },
    { href: "https://www.facebook.com/eventinlatina", icon: FacebookIcon, label: "Facebook" },
    { href: "https://www.youtube.com/@eventinlatina", icon: YoutubeIcon, label: "YouTube" },
    { href: "https://www.tiktok.com/@eventinlatina", icon: TikTokIcon, label: "TikTok" },
  ];

  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)]/80 backdrop-blur-xl mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/banner.png" alt="EventiNLatina" className="h-8 rounded-lg" />
            <span className="text-xs text-[var(--text-muted)]">© {new Date().getFullYear()} EventiNLatina</span>
          </div>

          <div className="flex items-center gap-1">
            {socials.map((s) => (
              <a key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all"
                title={s.label}
              >
                <s.icon size={18} />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <Link href="/events" className="hover:text-[var(--accent)] transition-colors">Eventi</Link>
            <Link href="/video" className="hover:text-[var(--accent)] transition-colors">Video</Link>
            <Link href="/radio" className="hover:text-[var(--accent)] transition-colors">Web Radio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
