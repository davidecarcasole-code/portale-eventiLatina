import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventiNLatina",
  description: "Eventi, spettacoli e cultura in provincia di Latina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
