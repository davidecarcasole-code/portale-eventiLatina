"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, Shield, Eye, Database, Mail, Truck, Lock, AlertCircle, CheckCircle, X, Settings, Cookie as CookieIcon, FileText, Shield as ShieldIcon, CheckCircle, AlertCircle, Mail as MailIcon, ChevronDown, ChevronUp } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [accepted, setAccepted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const categories = [
    {
      id: "necessary",
      name: "Necessari",
      description: "Essenziali per il funzionamento del sito",
      required: true,
      cookies: ["session_id", "csrf_token", "cookie_consent"],
    },
    {
      id: "analytics",
      name: "Analitici",
      description: "Ci aiutano a capire come gli utenti interagiscono col sito",
      required: false,
      cookies: ["_ga", "_gid", "_gat", "_ga_*"],
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Per mostrare annunci pertinenti",
      required: false,
      cookies: ["_fbp", "_gcl_au", "IDE"],
    },
    {
      id: "preferences",
      name: "Preferenze",
      description: "Memorizzano le tue preferenze (lingua, tema, ecc.)",
      required: false,
      cookies: ["locale", "theme", "timezone"],
    },
  ];

  const handleAcceptAll = () => {
    categories.forEach(c => localStorage.setItem(`cookie_${c.id}`, "true"));
    localStorage.setItem("cookie_consent", "all");
    setAccepted(true);
  };

  const handleRejectAll = () => {
    categories.filter(c => !c.required).forEach(c => localStorage.setItem(`cookie_${c.id}`, "false"));
    localStorage.setItem("cookie_consent", "necessary");
    setAccepted(true);
  };

  const handleSavePreferences = () => {
    categories.forEach(c => {
      if (!c.required) {
        localStorage.setItem(`cookie_${c.id}`, "true");
      }
    });
    localStorage.setItem("cookie_consent", "custom");
    setAccepted(true);
    setShowSettings(false);
  };

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (consent) setAccepted(true);
  }, []);

  return (
    <div className="page-container max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Informativa sulla Privacy</h1>
        <p className="text-[var(--text-muted)]">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>
      </div>

      <div className="space-y-8">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="text-[var(--accent)]" size={24} />
            1. Titolare del Trattamento
          </h2>
          <div className="prose text-[var(--text-secondary)] space-y-3">
            <p>Titolare del trattamento dei dati personali è <strong>EventiNLatina</strong> (di seguito "Titolare" o "Noi"), con sede in Latina, Italia.
            <p>Email per contatti privacy: <a href="mailto:privacy@eventinlatina.it" className="text-[var(--accent)] hover:underline">privacy@eventinlatina.it</a></p>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="text-[var(--accent)]" size={24} />
            2. Dati Raccolti e Finalità
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: "👤", title: "Dati di Navigazione", desc: "Indirizzo IP, tipo browser, sistema operativo, pagine visitate, orario accesso" },
                { icon: "📧", title: "Dati Forniti Volontariamente", desc: "Email, nome, preferenze salvate, eventi salvati" },
                { icon: "🍪", title: "Cookie e Tecnologie Simili", desc: "Cookie tecnici, analitici, di preferenza, marketing (vedi Cookie Policy)" },
                { icon: "📍", title: "Dati di Geolocalizzazione", desc: "Città/Provincia approssimativa da IP per suggerire eventi vicini" },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-xl p-4">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="text-[var(--accent)]" size={24} />
            3. Base Giuridica (Art. 6 GDPR)
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { base: "Esecuzione contratto / Misure precontrattuali", desc: "Fornitura servizi richiesti (salvataggio eventi, notifiche, preferenze)" },
              { base: "Consenso (Art. 6.1.a)", desc: "Cookie analitici, marketing, geolocalizzazione, newsletter" },
              { base: "Interesse Legittimo (Art. 6.1.f)", desc: "Sicurezza, prevenzione frodi, miglioramento servizio, analisi aggregate" },
              { base: "Obbligo Legale (Art. 6.1.c)", desc: "Adempimenti fiscali, contabili, richieste autorità" },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-xl p-4 border-l-4 border-[var(--accent)]">
                <p className="font-semibold">{item.base}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">{item.desc}</p>
              </div>
            )}
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Truck className="text-[var(--accent)]" size={24} />
            4. Destinatari e Trasferimento Dati
          </h2>
          <div className="prose text-[var(--text-secondary)] space-y-3">
            <p>I dati possono essere condivisi con:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Fornitori tecnici:</strong> Hosting (Vercel), Database (Supabase/PostgreSQL), CDN, Email (Resend/SendGrid)</li>
              <li><strong>Analytics:</strong> Google Analytics (anonimizzato), Vercel Analytics</li>
              <li><strong>Social/Media:</strong> Meta Pixel (Facebook/Instagram), Google Ads (solo con consenso)</li>
              <li><strong>Autorità:</strong> Su richiesta legittima da autorità competenti</li>
            </ul>
            <p className="mt-4"><strong>Trasferimenti extra-UE:</strong> Alcuni fornitori (Google, Meta, Vercel) possono trattare dati in USA. Utilizziamo clausole contrattuali standard (SCC) e adeguate garanzie per trasferimenti extra-UE.</p>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="text-[var(--accent)]" size={24} />
            5. Conservazione dei Dati
          </h2>
          <div className="space-y-3">
            {[
              { period: "Dati account", time: "Fino a cancellazione account + 30 giorni" },
              { period: "Cookie analytics", time: "Max 26 mesi (Google Analytics), 13 mesi (cookie tecnici)" },
              { period: "Log server / Sicurezza", time: "Max 12 mesi" },
              { period: "Dati marketing", time: "Fino a revoca consenso / 24 mesi inattività" },
              { period: "Log sicurezza / antifrode", time: "Max 24 mesi" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-[var(--card-border)] last:border-0">
                <span className="font-medium">{item.period}</span>
                <span className="text-[var(--text-muted)]">{item.time}</span>
              </div>
            )}
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Eye className="text-[var(--accent)]" size={24} />
            6. I Tuoi Diritti (Artt. 15-22 GDPR)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Accesso ai dati (Art. 15)",
              "Rettifica dati inesatti (Art. 16)",
              "Cancellazione / Diritto all'oblio (Art. 17)",
              "Limitazione trattamento (Art. 18)",
              "Portabilità dati (Art. 20)",
              "Opposizione al trattamento (Art. 21)",
              "Revoca consenso (in qualsiasi momento)",
              "Reclamo al Garante Privacy (Italia)",
            ].map((right, i) => (
              <div key={i} className="flex items-center gap-2 p-3 glass-card rounded-xl">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-sm">{right}</span>
              </div>
            )}
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm"><strong>Per esercitare i tuoi diritti:</strong> Scrivi a <a href="mailto:privacy@eventinlatina.it" className="text-[var(--accent)] hover:underline font-medium">privacy@eventinlatina.it</a>. Risponderemo entro 30 giorni.
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Cookie className="text-[var(--accent)]" size={24} />
            7. Cookie e Tecnologie di Tracciamento
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">Utilizziamo cookie e tecnologie simili. Per dettagli completi consulta la nostra <Link href="/cookie-policy" className="text-[var(--accent)] hover:underline font-medium">Cookie Policy completa</Link>.</          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Cookie className="text-[var(--accent)]" size={24} />
            4. Gestione Cookie (Consenso)
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">Al primo accesso, ti chiediamo il consenso per i cookie opzionali. Puoi:</p>
          <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
            <li><strong>Accettare tutti</strong> - Consenti tutti i cookie (analitici, marketing, preferenze)</li>
            <li><strong>Rifiutare opzionali</strong> - Solo cookie necessari attivi</li>
            <li><strong>Personalizzare</strong> - Scegli categoria per categoria</li>
          </ul>
          <p className="mt-4">Puoi modificare le tue preferenze in qualsiasi momento:</p>
          <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
            <li>Dal banner cookie (in basso a destra)</li>
            <li>Dal footer: <Link href="/cookie-policy" className="text-[var(--accent)] hover:underline">Cookie Policy</Link></li>
            <li>Cancellando i cookie del browser per questo sito</li>
          </ul>
        </section>

        <section className="glass-card rounded-2xl p-6 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-600 dark:text-amber-400" size={24} />
            Modifiche a questa Informativa
          </h2>
          <p className="text-[var(--text-secondary)]">Questa informativa può essere aggiornata. La data di "Ultimo aggiornamento" in alto indica l'ultima revisione. Per modifiche sostanziali, ti informeremo via email o con banner nel sito.</        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mail className="text-[var(--accent)]" size={24} />
            Contatti
          </h2>
          <div className="prose text-[var(--text-secondary)] space-y-2">
            <p>Per qualsiasi domanda su questa informativa o sui tuoi dati:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Email: <a href="mailto:privacy@eventinlatina.it" className="text-[var(--accent)] hover:underline">privacy@eventinlatina.it</a></li>
              <li>PEC: <a href="mailto:eventinlatina@pec.it" className="text-[var(--accent)] hover:underline">eventinlatina@pec.it</a></li>
              <li>Indirizzo: Latina, Italia</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
}