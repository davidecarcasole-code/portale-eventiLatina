import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBannerClient } from "@/components/AdBannerClient";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { AuthProvider } from "../providers";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
          <div className="px-4 md:px-6 pb-4">
            <AdBannerClient placement="banner" />
          </div>
          <Footer />
          <CookieConsentBanner />
        </div>
      </div>
    </AuthProvider>
  );
}
