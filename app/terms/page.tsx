import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termini di Servizio | EventiNLatina",
  description: "Termini e condizioni d'uso del portale EventiNLatina.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-6 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Torna alla Home
      </Link>

      <div className="glass-card rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Termini di Servizio</h1>
          <p className="text-sm text-[var(--text-muted)]">Ultimo aggiornamento: 28 luglio 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Accettazione dei Termini</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Utilizzando il portale EventiNLatina (di seguito &ldquo;il Portale&rdquo;), accessibile all&apos;indirizzo
            eventinlatina.vercel.app, l&apos;utente accetta integralmente i presenti Termini di Servizio.
            Se non si accetta uno qualsiasi di questi termini, si prega di non utilizzare il Portale.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Descrizione del Servizio</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            EventiNLatina è un portale informativo che raccoglie e pubblica annunci di eventi culturali,
            musicali, enogastronomici, sportivi e di intrattenimento nella provincia di Latina e nel Lazio.
            Il Portale aggregates eventi da fonti pubbliche tramite sistemi automatizzati (scraper) e
            consente la pubblicazione manuale da parte di utenti registrati.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Registrazione e Account</h2>
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
            <li>La registrazione è gratuita e consente di pubblicare eventi e salvare i propri preferiti.</li>
            <li>L&apos;utente è responsabile della sicurezza delle proprie credenziali di accesso.</li>
            <li>Ogni account deve essere personale e non trasferibile a terzi.</li>
            <li>EventiNLatina si riserva il diritto di sospendere o cancellare account che violino i presenti termini.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Pubblicazione di Eventi</h2>
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
            <li>Gli eventi pubblicati manualmente vengono sottoposti a revisione prima della pubblicazione.</li>
            <li>È vietato pubblicare contenuti falsi, ingannevoli, offensivi o che violino diritti di terzi.</li>
            <li>Le immagini allegate devono essere di pubblico dominio o per cui si possiedono i diritti.</li>
            <li>EventiNLatina si riserva il diritto di rimuovere eventi che violino le normative vigenti.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Proprietà Intellettuale</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Tutti i contenuti del Portale (testi, grafiche, logo, codice sorgente) sono protetti dalle
            leggi sul diritto d&apos;autore. È vietato copiare, riprodurre o distribuire i contenuti senza
            autorizzazione. I contenuti degli eventi pubblicati dagli utenti restano di proprietà dei
            rispettivi autori.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Limitazione di Responsabilità</h2>
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
            <li>EventiNLatina è un portale informativo e non è responsabile dell&apos;svolgimento effettivo degli eventi pubblicati.</li>
            <li>Le informazioni sono raccolte da fonti pubbliche e potrebbero non essere sempre accurate o aggiornate.</li>
            <li>Non si garantisce la disponibilità continua del servizio; il Portale potrebbe essere temporaneamente indisponibile per manutenzione.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Cookie e Dati Personali</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Il Portale utilizza cookie tecnici per il funzionamento e, previo consenso, cookie analitici
            per migliorare l&apos;esperienza utente. Per dettagli completi sulla raccolta e il trattamento
            dei dati personali, consultare la nostra{' '}
            <Link href="/privacy" className="text-[var(--accent)] hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Modifiche ai Termini</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            EventiNLatina si riserva il diritto di modificare questi termini in qualsiasi momento.
            Le modifiche saranno pubblicate su questa pagina con la data di ultimo aggiornamento.
            L&apos;uso continuato del Portale dopo le modifiche costituisce accettazione dei nuovi termini.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Contatti</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Per domande o richieste relative ai presenti Termini di Servizio, è possibile contattarci
            all&apos;indirizzo email: <span className="text-[var(--accent)]">000eventweb@gmail.com</span>
          </p>
        </section>
      </div>
    </div>
  );
}
