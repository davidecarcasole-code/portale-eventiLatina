import type { Metadata } from "next";
import "./globals.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

export const metadata: Metadata = {
  title: "EventiNLatina — Eventi, spettacoli e cultura in provincia di Latina",
  description: "Scopri tutti gli eventi, spettacoli, sagre e manifestazioni in provincia di Latina e nel Lazio",
  icons: [{ rel: "icon", url: "/logo.png" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
