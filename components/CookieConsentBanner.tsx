"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, Shield, Eye, Database, Mail, Truck, Lock, AlertCircle, CheckCircle, X, Settings, Cookie as CookieIcon, FileText, Shield as ShieldIcon, CheckCircle, AlertCircle, Mail as MailIcon, ChevronDown, ChevronUp } from "lucide-react";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    } else if (consent === "custom") {
      // Load saved preferences
      const prefs = {
        necessary: true,
        analytics: localStorage.getItem("cookie_analytics") === "true",
        marketing: localStorage.getItem("cookie_marketing") === "true",
        preferences: localStorage.getItem("cookie_preferences") === "true",
      };
      setPreferences(prefs);
    }
  }, []);

  const acceptAll = () => {
    const prefs = { necessary: true, analytics: true, marketing: true, preferences: true };
    setPreferences(prefs);
    localStorage.setItem("cookie_consent", "all");
    localStorage.setItem("cookie_analytics", "true");
    localStorage.setItem("cookie_marketing", "true");
    localStorage.setItem("cookie_preferences", "true");
    setVisible(false);
    applyCookies();
  };

  const rejectAll = () => {
    const prefs = { necessary: true, analytics: false, marketing: false, preferences: false };
    setPreferences(prefs);
    localStorage.setItem("cookie_consent", "necessary");
    localStorage.setItem("cookie_analytics", "false");
    localStorage.setItem("cookie_marketing", "false");
    localStorage.setItem("cookie_preferences", "false");
    setVisible(false);
    applyCookies();
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem(`cookie_${key}`, value.toString());
  };

  const savePreferences = () => {
    localStorage.setItem("cookie_consent", "custom");
    localStorage.setItem("cookie_analytics", preferences.analytics.toString());
    localStorage.setItem("cookie_marketing", preferences.marketing.toString());
    localStorage.setItem("cookie_preferences", preferences.preferences.toString());
    applyCookies();
  };

  const applyCookies = () => {
    // Apply analytics cookies
    if (preferences.analytics) {
      // Enable Google Analytics
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    } else {
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    }

    if (preferences.marketing) {
      window.gtag?.('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    } else {
      window.gtag?.('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-auto max-w-4xl px-4 pb-4">
        <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-2xl border border-[var(--card-border)]">
          {/* Compact view */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Cookie size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Cookie e Privacy</h3>
                <p className="text-sm text-[var(--text-muted)]">Usiamo cookie per migliorare la tua esperienza</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={acceptAll} className="btn-primary px-4 py-2 rounded-xl text-sm font-medium">
                Accetta tutti
              </button>
              <button onClick={() => setShowDetails(!showDetails)} className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] transition-all">
                {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <button onClick={() => { localStorage.setItem("cookie_consent", "necessary"); setVisible(false); }} className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--accent-subtle)] transition-all" aria-label="Chiudi">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Detailed preferences */}
          {showDetails && (
            <div className="border-t border-[var(--card-border)] pt-4 animate-slide-down">
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Scegli quali cookie accettare</h4>
                <p className="text-sm text-[var(--text-muted)]">I cookie necessari sono sempre attivi. Gli altri sono opzionali.</              </div>

              <div className="space-y-3">
                {/* Necessary - always on */}
                <div className="glass-card rounded-xl p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Shield size={18} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Cookie Necessari</p>
                        <p className="text-xs text-[var(--text-muted)]">Essenziali per il funzionamento del sito</p>
                      </div>
                    </div>
                    <input type="checkbox" checked disabled className="w-5 h-5 text-[var(--accent)] rounded" />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Shield size={18} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Cookie Analitici</p>
                        <p className="text-xs text-[var(--text-muted)]">Google Analytics (anonimo) - _ga, _gid, _gat</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange("analytics", e.target.checked)}
                      className="w-5 h-5 text-[var(--accent)] rounded"
                    />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Settings size={18} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">Cookie Marketing</p>
                        <p className="text-xs text-[var(--text-muted)]">Meta/Facebook Pixel, Google Ads - _fbp, _gcl_au</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => handlePreferenceChange("marketing", e.target.checked)}
                      className="w-5 h-5 text-[var(--accent)] rounded"
                    />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Settings size={18} className="text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium">Cookie Preferenze</p>
                        <p className="text-xs text-[var(--text-muted)]">Lingua, tema, fuso orario - locale, theme</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={(e) => handlePreferenceChange("preferences", e.target.checked)}
                      className="w-5 h-5 text-[var(--accent)] rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={rejectAll} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] transition-all">
                  Rifiuta opzionali
                </button>
                <button onClick={savePreferences} className="btn-primary flex-1 px-4 py-2.5 rounded-xl text-sm font-medium">
                  Salva preferenze
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;