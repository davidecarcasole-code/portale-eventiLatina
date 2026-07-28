import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | EventiNLatina",
  description: "Informativa sulla privacy e protezione dei dati personali di EventiNLatina.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-6 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Torna alla Home
      </Link>

      <div className="glass-card rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-[var(--text-muted)]">Ultimo aggiornamento: 28 luglio 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Titolare del Trattamento</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            EventiNLatina<br />
            Email: info@eventinlatina.it<br />
            Sito web: eventinlatina.vercel.app
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Dati Raccolti</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Il Portale raccoglie le seguenti categorie di dati personali:
          </p>
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>Dati di registrazione:</strong> nome, indirizzo email (solo per utenti registrati).</li>
            <li><strong>Dati di navigazione:</strong> indirizzo IP (hashato), pagine visitate, referrer, User Agent.</li>
            <li><strong>Cookie:</strong> cookie tecnici necessari e, previo consenso, cookie analitici.</li>
            <li><strong>Dati forniti volontariamente:</strong> informazioni inserite nei form di pubblicazione eventi.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Finalità del Trattamento</h2>
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
            <li>Fornitura e miglioramento del servizio di pubblicazione eventi.</li>
            <li>Gestione degli account utente e autenticazione.</li>
            <li>Analisi statistiche anonime sul traffico del portale.</li>
            <li>Prevenzione di abusi e frodi.</li>
            <li>Adempimento di obblighi legali.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Base Giuridica</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Il trattamento si basa su: esecuzione del contratto (registrazione e utilizzo del servizio),
            consenso dell&apos;interessato (cookie analitici) e legittimo interesse (prevenzione frodi,
            analisi statistiche aggregate).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Conservazione dei Dati</h2>
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
            <li>Dati di registrazione: fino alla cancellazione dell&apos;account.</li>
            <li>Dati di navigazione: massimo 12 mesi dalla raccolta.</li>
            <li>Log degli accessi: massimo 6 mesi.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Diritti dell&apos;Interessato</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            In conformità al Regolamento UE 2016/679 (GDPR), l&apos;utente ha diritto a:
          </p>
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
            <li>Accesso ai propri dati personali.</li>
            <li>Rettificazione dei dati inesatti.</li>
            <li>Cancellazione dei dati (&ldquo;diritto all&apos;oblio&rdquo;).</li>
            <li>Limitazione del trattamento.</li>
            <li>Portabilità dei dati.</li>
            <li>Opposizione al trattamento.</li>
            <li>Revoca del consenso in qualsiasi momento.</li>
          </ul>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Per esercitare i propri diritti, contattare: <span className="text-[var(--accent)]">info@eventinlatina.it</span>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Sicurezza dei Dati</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            EventiNLatina adotta misure tecniche e organizzative appropriate per proteggere i dati
            personali da accessi non autorizzati, perdita, alterazione o distribuzione illecita.
            Le connessioni sono protette mediante protocollo HTTPS/TLS.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Cookie</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Il Portale utilizza le seguenti categorie di cookie:
          </p>
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>Cookie tecnici (necessari):</strong> autenticazione, preferenze utente, sessione. Non richiedono consenso.</li>
            <li><strong>Cookie analitici:</strong> raccolta anonima di statistiche di utilizzo. Richiedono consenso.</li>
          </ul>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            L&apos;utente può gestire le preferenze cookie in quals momento tramite il pannello dedicato.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Modifiche alla Privacy Policy</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            EventiNLatina si riserva il diritto di aggiornare questa informativa. Le modifiche
            saranno pubblicate su questa pagina con la data di ultimo aggiornamento.
          </p>
        </section>
      </div>
    </div>
  );
}
