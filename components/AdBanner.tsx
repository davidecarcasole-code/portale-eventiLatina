"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

type AdItem = {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  placement: string;
  size: string;
};

type AdBannerProps = {
  placement: "sidebar" | "banner" | "inline" | "footer";
  className?: string;
};

const sizeClasses: Record<string, string> = {
  square: "w-full max-w-[300px]",
  horizontal: "w-full",
  vertical: "w-full max-w-[160px]",
  leaderboard: "w-full",
};

export function AdBanner({ placement, className = "" }: AdBannerProps) {
  const [ad, setAd] = useState<AdItem | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/ads?placement=${placement}`)
      .then((r) => r.json())
      .then((d) => {
        const ads = d.ads || [];
        if (ads.length > 0) {
          setAd(ads[Math.floor(Math.random() * ads.length)]);
        }
      })
      .catch(() => {});
  }, [placement]);

  if (!ad) return null;

  const inner = (
    <div className={`relative group overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:shadow-[0_0_20px_var(--accent-glow)] ${sizeClasses[ad.size] || 'w-full'} ${className}`}>
      <div className="relative aspect-video max-h-[120px] overflow-hidden">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
        />
        {!loaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse flex items-center justify-center">
            <span className="text-xs text-[var(--text-muted)]">Caricamento...</span>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-sm text-[9px] text-white/70 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
          Sponsor
        </div>
        {ad.linkUrl && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
              Apri <ExternalLink size={10} />
            </span>
          </div>
        )}
      </div>
      {ad.size !== "square" && (
        <div className="px-3 py-1.5 border-t border-[var(--card-border)]">
          <p className="text-[10px] text-[var(--text-muted)] truncate">{ad.title}</p>
        </div>
      )}
    </div>
  );

  if (ad.linkUrl) {
    return (
      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer nofollow"
        onClick={async () => {
          try { await fetch(`/api/ads/${ad.id}/click`, { method: "POST" }); } catch {}
        }}>
        {inner}
      </a>
    );
  }

  return inner;
}
