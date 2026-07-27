"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("visit_sid");
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    sessionStorage.setItem("visit_sid", id);
  }
  return id;
}

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const path = pathname || "/";
    const key = `visited_${path}`;
    const last = sessionStorage.getItem(key);
    const now = Date.now();
    if (last && now - parseInt(last) < 5 * 60 * 1000) return;
    sessionStorage.setItem(key, String(now));

    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, session_id: getSessionId() }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
