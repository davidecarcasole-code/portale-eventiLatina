"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { CookieConsent } from "@/components/CookieConsent";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (token && !user) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) setAuth(data.user, token);
        })
        .catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    const root = document.documentElement;
    if (user?.theme === "dark") root.classList.add("dark");
    else if (user?.theme === "light") root.classList.remove("dark");
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
    if (user?.accent_color) {
      root.style.setProperty("--accent", user.accent_color);
    }
  }, [user?.theme, user?.accent_color]);

  return (
    <>
      {children}
      <CookieConsent />
    </>
  );
}
