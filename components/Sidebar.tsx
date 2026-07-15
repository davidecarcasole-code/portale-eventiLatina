"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Radio, Bookmark, User, Shield, LogOut, Menu, X, Heart, Rocket, Bell, Film, ExternalLink, Waves, Clapperboard } from "lucide-react";
import { InstagramIcon, FacebookIcon, YoutubeIcon, TikTokIcon } from "./SocialIcons";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { NotificationBell } from "./NotificationBell";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/events", label: "Eventi", icon: Calendar },
    { href: "/radio", label: "Web Radio", icon: Radio },
    { href: "/video", label: "Video", icon: Film },
    { href: "/andiamo-al-cinema", label: "Andiamo al Cinema", icon: Clapperboard },
    { href: "/tutti-al-mare", label: "Tutti al Mare", icon: Waves },
    { href: "/spazio-venere", label: "Spazio Venere", icon: Heart },
    { href: "/spazio-kids", label: "Spazio Kids", icon: Rocket },
    { href: "/saved", label: "Salvati", icon: Bookmark },
    { href: "/profile", label: "Profilo", icon: User },
    ...(user?.role === "admin" || user?.role === "super_admin" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <>
      {isDesktop ? (
        <aside className="sticky top-0 h-screen w-[var(--sidebar-width)] bg-[var(--card-bg)]/95 backdrop-blur-xl border-r border-[var(--card-border)] flex flex-col flex-shrink-0">
          <SidebarContent links={links} pathname={pathname} user={user} logout={logout} onClose={() => setOpen(false)} />
        </aside>
      ) : (
        <>
          <button onClick={() => setOpen(true)} className="fixed top-3 left-3 z-50 p-2.5 rounded-xl glass">
            <Menu size={20} />
          </button>
          {open && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />}
          {open && (
            <aside className="fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] bg-[var(--card-bg)]/95 backdrop-blur-xl border-r border-[var(--card-border)] flex flex-col animate-fade-in">
              <SidebarContent links={links} pathname={pathname} user={user} logout={logout} onClose={() => setOpen(false)} showClose />
            </aside>
          )}
        </>
      )}
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
      <div className="px-1.5 py-2 border-b border-[var(--card-border)]">
        <Link href="/dashboard" onClick={onClose} className="block group relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <DarkBanner />
        </Link>
        {showClose && <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] ml-auto mt-2"><X size={16} /></button>}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-gradient-to-r from-[var(--accent)] to-indigo-500 text-white shadow-lg shadow-[var(--accent-glow)]" : "text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]"}`}>
              <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-2">
        <SidebarAdSlider />
      </div>
      {user && (
        <div className="p-3 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-gradient-to-r from-[var(--accent-subtle)] to-transparent">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)] truncate">{user.name || user.email}</span>
            <div className="ml-auto"><NotificationBell dropUp={true} /></div>
          </div>
          <div className="flex items-center justify-center gap-0.5 mb-2">
            <a href="https://www.instagram.com/eventinlatina/" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all" title="Instagram">
              <InstagramIcon size={15} />
            </a>
            <a href="https://www.facebook.com/eventinlatina" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" title="Facebook">
              <FacebookIcon size={15} />
            </a>
            <a href="https://www.youtube.com/@eventinlatina" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="YouTube">
              <YoutubeIcon size={15} />
            </a>
            <a href="https://www.tiktok.com/@eventinlatina" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all" title="TikTok">
              <TikTokIcon size={15} />
            </a>
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

function SidebarAdSlider() {
  const [ads, setAds] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/ads?placement=sidebar")
      .then(r => r.json())
      .then(d => {
        const items = d.ads || [];
        setAds(items);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (ads.length < 2) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (!loaded) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] min-h-[120px] animate-pulse flex items-center justify-center">
        <span className="text-xs text-[var(--text-muted)]">Caricamento...</span>
      </div>
    );
  }

  if (ads.length === 0) return null;

  const a = ads[current];

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:shadow-[0_0_20px_var(--accent-glow)] group">
      {ads.length > 1 && (
        <div className="absolute top-1.5 left-1.5 z-10 flex gap-1">
          {ads.map((_, i) => (
            <button key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
      {a.linkUrl ? (
        <a href={a.linkUrl} target="_blank" rel="noopener noreferrer nofollow"
          onClick={async () => { try { await fetch(`/api/ads/${a.id}/click`, { method: "POST" }); } catch {} }}
          className="block"
        >
          <AdSlide ad={a} />
        </a>
      ) : (
        <AdSlide ad={a} />
      )}
    </div>
  );
}

function DarkBanner() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return (
    <img src="/logo.png" alt="EventiNLatina"
      className="w-full rounded-2xl transition-all shadow-lg"
      style={dark ? { filter: 'brightness(0) invert(1)' } : undefined} />
  );
}

function AdSlide({ ad }: { ad: any }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="relative">
      <div className="relative aspect-video">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse flex items-center justify-center">
            <span className="text-xs text-[var(--text-muted)]">Caricamento...</span>
          </div>
        )}
        {imgError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center gap-1">
            <span className="text-lg opacity-30">📷</span>
            <span className="text-[10px] text-[var(--text-muted)]">{ad.title}</span>
          </div>
        )}
        {ad.linkUrl && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
              Apri <ExternalLink size={10} />
            </span>
          </div>
        )}
      </div>
      <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-sm text-[9px] text-white/70 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
        Ad
      </div>
      <div className="px-3 py-1.5 border-t border-[var(--card-border)]">
        <p className="text-[10px] text-[var(--text-muted)] truncate">{ad.title}</p>
      </div>
    </div>
  );
}
