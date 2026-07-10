"use client";

import { AdBanner } from "./AdBanner";

export function AdBannerClient({ placement, className }: { placement: "sidebar" | "banner" | "inline" | "footer"; className?: string }) {
  return <AdBanner placement={placement} className={className} />;
}
