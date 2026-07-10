"use client";

import { Video } from "lucide-react";
import { useState } from "react";

type VideoItem = {
  id: number;
  title: string;
  description?: string;
  embedUrl: string;
  thumbnail?: string;
  platform: string;
};

export function VideoCard({ video }: { video: VideoItem }) {
  const [loaded, setLoaded] = useState(false);

  const platformIcons: Record<string, string> = {
    youtube: "▶",
    vimeo: "V",
    instagram: "📷",
    facebook: "f",
    tiktok: "♪",
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden card-hover group">
      <div className="relative aspect-video bg-black/80 flex items-center justify-center overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                <span className="text-3xl">{platformIcons[video.platform] || "🎬"}</span>
                <span className="text-[10px] uppercase tracking-wider font-medium">{video.platform}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video size={24} className="text-white ml-0.5" fill="white" />
              </div>
            </div>
          </div>
        )}
        <iframe
          src={video.embedUrl}
          title={video.title}
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="p-4 space-y-1">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2">{video.description}</p>
        )}
        <span className="inline-block text-[10px] uppercase tracking-wider font-medium text-[var(--text-muted)] mt-1">
          {video.platform}
        </span>
      </div>
    </div>
  );
}
