"use client";

import Link from "next/link";
import { FacebookIcon, InstagramIcon, YoutubeIcon, TikTokIcon } from "@/components/SocialIcons";

export function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--card-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/Bannertrasp.png" alt="EventiNLatina" className="w-40 h-auto" />
            </Link>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
              Il portale degli eventi in provincia di Latina. Scopri concerti, sagre, teatro, cinema e cultura.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/eventinlatina" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-pink-500 hover:border-pink-500 transition-all">
                <InstagramIcon size={18} />
              </a>
              <a href="https://facebook.com/eventinlatina" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-blue-500 hover:border-blue-500 transition-all">
                <FacebookIcon size={18} />
              </a>
              <a href="https://youtube.com/@eventinlatina" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500 transition-all">
                <YoutubeIcon size={18} />
              </a>
              <a href="https://tiktok.com/@eventinlatina" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-purple-500 hover:border-purple-500 transition-all">
                <TikTokIcon size={18} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Eventi</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/events" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Tutti gli eventi</Link>
              <Link href="/events?category=musica" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Musica & Concerti</Link>
              <Link href="/events?category=teatro" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Teatro & Spettacoli</Link>
              <Link href="/events?category=sport" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Sport</Link>
              <Link href="/events?category=cultura" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Cultura & Mostre</Link>
              <Link href="/events?category=enogastronomia" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Sagre & Enogastronomia</Link>
              <Link href="/events?category=bambini" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Bambini & Famiglie</Link>
              <Link href="/andiamo-al-cinema" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Andiamo al Cinema</Link>
              <Link href="/tutti-al-mare" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Tutti al Mare</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Sezioni Speciali</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/spazio-venere" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Spazio Venere</Link>
              <Link href="/spazio-kids" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Spazio Kids</Link>
              <Link href="/radio" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Web Radio</Link>
              <Link href="/video" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Video</Link>
              <Link href="/saved" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">I miei salvati</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/terms" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Termini di Servizio</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-[var(--card-border)] pt-8 mt-8">
          <p className="text-sm text-[var(--text-muted)] text-center">
            &copy; {new Date().getFullYear()} EventiNLatina. Tutti i diritti riservati.
          </p>
          <p className="text-xs text-[var(--text-muted)] text-center mt-1">
            Realizzato con <span className="text-red-500">♥</span> per Latina e il Lazio
          </p>
        </div>
      </div>
    </footer>
  );
}