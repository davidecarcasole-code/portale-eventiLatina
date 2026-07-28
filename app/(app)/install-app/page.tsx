"use client";

import Link from "next/link";
import { ArrowLeft, Download, Smartphone, Globe, ChevronRight, Check } from "lucide-react";

const STEPS_ANDROID = [
  { step: 1, title: "Apri il sito in Chrome", desc: "Apri eventinlatina.vercel.app nel browser Google Chrome del tuo smartphone." },
  { step: 2, title: "Tocca il menu ⋮", desc: "In alto a destra, tocca i tre puntini verticali per aprire il menu del browser." },
  { step: 3, title: 'Seleziona "Aggiungi a schermata Home"', desc: "Nel menu, cerca e tocca la voce \"Aggiungi a schermata Home\" o \"Installa app\"." },
  { step: 4, title: "Conferma il nome", desc: "Puoi modificare il nome che apparirà sulla schermata. Tocca \"Aggiungi\" per confermare." },
  { step: 5, title: "Fatto!", desc: "L'icona di EventiNLatina apparirà sulla tua schermata Home come una normale app." },
];

const STEPS_IOS = [
  { step: 1, title: "Apri il sito in Safari", desc: "Apri eventinlatina.vercel.app nel browser Safari del tuo iPhone o iPad." },
  { step: 2, title: "Tocca il pulsante Condividi", desc: "In basso, tocca il quadrato con la freccia verso l'alto (pulsante Condividi/Safari Share)." },
  { step: 3, title: 'Seleziona "Aggiungi alla schermata Home"', desc: "Scorri tra le opzioni e tocca \"Aggiungi alla schermata Home\"." },
  { step: 4, title: "Conferma", desc: "Controlla il nome e l'icona, poi tocca \"Aggiungi\" in alto a destra." },
  { step: 5, title: "Fatto!", desc: "Tocca \"Fine\" e troverai EventiNLatina come un'app sulla tua schermata Home." },
];

function StepCard({ step, total }: { step: { step: number; title: string; desc: string }; total: number }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
          {step.step}
        </div>
        {step.step < total && <div className="w-px flex-1 bg-[var(--card-border)] my-1" />}
      </div>
      <div className="pb-6">
        <p className="text-sm font-semibold mb-0.5">{step.title}</p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}

export default function InstallAppPage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Torna alla Home
      </Link>

      {/* Hero */}
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center shadow-lg">
          <Download size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold">Installa EventiNLatina</h1>
        <p className="text-[var(--text-muted)] max-w-md mx-auto text-sm leading-relaxed">
          Aggiungi il portale alla schermata Home del tuo smartphone per accedere rapidamente a tutti gli eventi, come se fosse un&apos;app nativa.
        </p>
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Smartphone size={16} className="text-[var(--accent)]" />
            <span>Funziona su Android e iOS</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Globe size={16} className="text-[var(--accent)]" />
            <span>Nessun download necessario</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Perché installarla?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Accesso Veloce", desc: "Un tocco e sei subito sul portale" },
            { icon: "🔔", title: "Notifiche", desc: "Rimani aggiornato sui nuovi eventi" },
            { icon: "📐", title: "Schermo Intero", desc: "Esperienza simile a un'app nativa" },
          ].map((b) => (
            <div key={b.title} className="flex flex-col items-center text-center p-4 rounded-xl bg-[var(--bg-secondary)]">
              <span className="text-2xl mb-2">{b.icon}</span>
              <p className="text-sm font-semibold mb-1">{b.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Android */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">Android</h2>
            <p className="text-xs text-[var(--text-muted)]">Google Chrome, Samsung Internet, Edge</p>
          </div>
        </div>
        <div className="space-y-0">
          {STEPS_ANDROID.map((s) => (
            <StepCard key={s.step} step={s} total={STEPS_ANDROID.length} />
          ))}
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
          <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">Suggerimento</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Su Android 12+ potresti vedere direttamente il pulsante <strong>&quot;Installa app&quot;</strong> nella barra degli indirizzi.
            </p>
          </div>
        </div>
      </div>

      {/* iOS */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-500 flex items-center justify-center">
            <span className="text-lg">🍎</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">iPhone e iPad</h2>
            <p className="text-xs text-[var(--text-muted)]">Safari (obbligatorio su iOS)</p>
          </div>
        </div>
        <div className="space-y-0">
          {STEPS_IOS.map((s) => (
            <StepCard key={s.step} step={s} total={STEPS_IOS.length} />
          ))}
        </div>
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 flex items-start gap-3">
          <Check size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold">Nota per iOS</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Su iOS non è possibile installare PWA da Chrome o altri browser. Usa sempre <strong>Safari</strong>.
              L&apos;app installata non apparirà nello Store ma funzionerà come un&apos;app normale.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-8">
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          Vai al Portale <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
