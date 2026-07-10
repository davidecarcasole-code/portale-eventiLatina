"use client";

import { Bell, CheckCheck, RefreshCw, X } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";

interface Notification {
  id: number;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
  event?: { id: number; title: string; date: string; imageUrl?: string } | null;
}

export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { token } = useAuthStore();

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = async () => {
    if (!token) return;
    await fetch("/api/notifications/read-all", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: number) => {
    if (!token) return;
    await fetch(`/api/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const checkNow = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await fetch("/api/notifications/check", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchNotifs();
    } catch {}
    setLoading(false);
  };

  if (!token) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-[var(--accent-subtle)] transition-all duration-200"
      >
        <Bell size={18} strokeWidth={1.5} className="text-[var(--text-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl shadow-2xl z-50 max-h-96 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)]">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Notifiche</span>
            <div className="flex gap-1">
              <button onClick={checkNow} disabled={loading}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                title="Controlla nuovi eventi">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  title="Segna tutte come lette">
                  <CheckCheck size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                Nessuna notifica
              </div>
            ) : (
              items.map((n) => (
                <div key={n.id}
                  className={`px-4 py-3 border-b border-[var(--card-border)] last:border-b-0 transition-colors ${!n.isRead ? "bg-[var(--accent-subtle)]/30" : ""} hover:bg-[var(--bg-secondary)]`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"} text-[var(--text-primary)] truncate`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      {n.event && (
                        <Link href={`/events/${n.event.id}`} onClick={() => setOpen(false)}
                          className="text-xs text-[var(--accent)] hover:underline mt-1 inline-block">
                          Vedi evento →
                        </Link>
                      )}
                    </div>
                    {!n.isRead && (
                      <button onClick={() => markRead(n.id)}
                        className="p-1 rounded hover:bg-[var(--bg-secondary)] shrink-0 mt-0.5">
                        <X size={12} className="text-[var(--text-muted)]" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
