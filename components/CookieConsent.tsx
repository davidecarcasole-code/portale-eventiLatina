"use client";

import { useEffect, useState } from "react";
import { X, Cookie, Settings, Check, ChevronDown, ChevronUp } from "lucide-react";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setPreferences(parsed.preferences);
      } catch {}
    }
  }, []);

  const acceptAll = () => {
    const newPrefs = { necessary: true, analytics: true, marketing: true };
    setPreferences(newPrefs);
    saveConsent(newPrefs);
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const newPrefs = { necessary: true, analytics: false, marketing: false };
    setPreferences(newPrefs);
    saveConsent(newPrefs);
    setShowBanner(false);
  };

  const savePreferences = () => {
    saveConsent(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({
        preferences: prefs,
        timestamp: Date.now(),
      })
    );

    if (prefs.analytics) {
      enableAnalytics();
    }
    if (prefs.marketing) {
      enableMarketing();
    }
  };

  const enableAnalytics = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const enableMarketing = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:bottom-6 md:right-6 md:left-auto md:w-[420px] z-[9999] animate-slide-up">
      <div className="glass-card rounded-2xl shadow-2xl border border-[var(--card-border)] overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Cookie size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                Cookie e Privacy
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                Utilizziamo cookie necessari per il funzionamento del sito e, con il tuo consenso, cookie
                analitici e di marketing per migliorare la tua esperienza.
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-colors flex-shrink-0"
              aria-label="Chiudi"
            >
              <X size={18} />
            </button>
          </div>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-[var(--card-border)] animate-slide-down">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-white" />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">Necessari</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-green-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer checked:after:translate-x-full peer checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:border-white" />
                  </label>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] ml-7">
                  Indispensabili per la navigazione e l'accesso alle aree protette. Non possono essere disattivati.
                </p>

                <button
                  onClick={() => togglePreference("analytics")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-white" />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">Analitici</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference("analytics")}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 transition-colors ${
                      preferences.analytics ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                    }`} />
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </label>
                </button>
                <p className="text-[11px] text-[var(--text-muted)] ml-7">
                  Ci aiutano a capire come i visitatori interagiscono con il sito (pagine visitate, tempo di permanenza).
                </p>

                <button
                  onClick={() => togglePreference("marketing")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-pink-500 flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-white" />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">Marketing</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference("marketing")}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 transition-colors ${
                      preferences.marketing ? "bg-pink-500" : "bg-gray-300 dark:bg-gray-600"
                    }`} />
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </label>
                </button>
                <p className="text-[11px] text-[var(--text-muted)] ml-7">
                  Utilizzati per mostrarti annunci personalizzati e misurare l'efficacia delle campagne pubblicitarie.
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={acceptNecessary}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-[var(--text-secondary)] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors"
                >
                  Solo necessari
                </button>
                <button
                  onClick={savePreferences}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-500/25"
                >
                  Salva preferenze
                </button>
              </div>
            </div>
          )}

          {!showDetails && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={acceptAll}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-500/25"
              >
                Accetta tutti
              </button>
              <button
                onClick={acceptNecessary}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-[var(--text-secondary)] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors"
              >
                Solo necessari
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] transition-colors"
                aria-label="Personalizza"
              >
                <Settings size={18} />
              </button>
            </div>
          )}

          <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center">
            Puoi modificare le tue preferenze in qualsiasi momento dalle impostazioni.
            <a href="/privacy" className="text-[var(--accent)] hover:underline ml-1">
              Informativa completa
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}