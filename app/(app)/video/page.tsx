"use client";

import { useEffect, useState, useCallback } from "react";
import { Film, Plus, Trash2, X, Video } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";

export default function VideoPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((d) => { setVideos(d.videos || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse-neon">
          <Film size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Video</h1>
          <p className="text-sm text-[var(--text-muted)]">Scopri i video di eventi, territori e esperienze nel Lazio</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Caricamento video...</p>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
            <Video size={28} className="text-red-400" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)]">Nessun video disponibile</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Torna presto per nuovi contenuti</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map((v: any) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
