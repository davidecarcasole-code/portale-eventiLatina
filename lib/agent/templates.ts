export interface EnrichEvent {
  id: number;
  title: string;
  date: Date | null;
  city: string | null;
  location: string | null;
  time: string | null;
  categorySlug: string;
  categoryName: string;
}

const MONTHS_IT = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

function fmtDate(d: Date): string {
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ───── Template per categoria ───── */

const TEMPLATES: Record<string, string[]> = {
  musica: [
    '{title} ti aspetta a {city} il {date}{time, per una serata all\'insegna della buona musica}. Un\'occasione imperdibile per gli amanti del genere, in un\'atmosfera coinvolgente.{location, Si terrà presso {location}}.',
    'Preparati a vivere {title}, l\'evento musicale che animerà {city} il {date}.{time, Appuntamento alle {time}}{location, presso {location}}. Una serata da non perdere!',
    'Il {date} a {city} va in scena {title}.{time, Alle {time}}{location, presso {location}} musica dal vivo, energia e divertimento ti aspettano.',
    '{title} arriva a {city}! {date}{time, alle {time}} per una serata di musica e spettacolo.{location, L\'appuntamento è a {location}}.',
    'Musica a tutto volume a {city} con {title}. {date}{time, – ore {time}}{location, – {location}}. Porta gli amici e vieni a ballare!',
  ],
  teatro: [
    '{title} va in scena a {city} il {date}.{time, Alle {time}}{location, presso {location}}. Uno spettacolo teatrale che emozionerà il pubblico con una performance unica.',
    'Il teatro di {city} ospita {title} il {date}.{time, Appuntamento alle {time}}{location, presso {location}}. Una pièce avvincente da vedere assolutamente.',
    'Sipario su {title}! {date} a {city}{time, alle {time}}{location, – {location}}. Un\'esperienza culturale che unisce tradizione e innovazione.',
    '{title} – teatro a {city} il {date}.{time, Ore {time}}{location, – {location}}. Lasciati trasportare dalla magia del palcoscenico.',
    'Grande attesa per {title} in programma a {city} il {date}.{time, Alle {time}}{location, presso {location}} uno spettacolo che promette forti emozioni.',
  ],
  cultura: [
    '{title} è l\'evento culturale da non perdere a {city} il {date}.{time, Alle {time}}{location, presso {location}}. Un\'occasione per approfondire e scoprire qualcosa di nuovo.',
    'Cultura a {city}: il {date} appuntamento con {title}.{time, Ore {time}}{location, – {location}}. Ingresso aperto a tutti gli appassionati.',
    '{title} ti aspetta a {city} il {date}.{time, Alle {time}}{location, presso {location}}. Un viaggio affascinante tra arte, storia e conoscenza.',
    'Il {date} a {city} torna {title}.{time, Dalle {time}}{location, presso {location}}. Un evento culturale che arricchisce il panorama locale.',
    'Scopri {title} a {city} il {date}.{time, Alle {time}}{location, – {location}}. Un appuntamento con la cultura da segnare in agenda.',
  ],
  sport: [
    'Grande sport a {city} con {title}! {date}{time, alle {time}}{location, – {location}}. Vivi l\'emozione della competizione e tifa i tuoi preferiti.',
    '{title} anima {city} il {date}.{time, Ore {time}}{location, presso {location}}. Un evento sportivo che unisce atleti e appassionati.',
    'Pronti, partenza, via! {title} a {city} il {date}{time, alle {time}}{location, presso {location}}. Non mancare a questo appuntamento sportivo.',
    'Sport e agonismo a {city}: {date} con {title}.{time, Alle {time}}{location, – {location}}. Ingresso libero per tutti gli sportivi.',
    '{title} – l\'evento sportivo dell\'anno a {city}. {date}{time, ore {time}}{location, – {location}}. Vieni a tifare!',
  ],
  natura: [
    '{title} ti porta alla scoperta della natura a {city} il {date}.{time, Alle {time}}{location, – {location}}. Un\'esperienza all\'aria aperta per tutta la famiglia.',
    'Immergiti nella natura con {title} a {city} il {date}.{time, Ore {time}}{location, presso {location}}. Un\'occasione per riconnettersi con l\'ambiente.',
    'Il {date} a {city} si celebra {title}.{time, Dalle {time}}{location, presso {location}}. Natura, paesaggi e biodiversità ti aspettano.',
    '{title}: una giornata nella natura a {city}. {date}{time, alle {time}}{location, – {location}}. Perfetto per grandi e piccoli.',
    'A {city} il {date} appuntamento con {title}.{time, Alle {time}}{location, presso {location}}. Scopri le meraviglie naturali del territorio.',
  ],
  trekking: [
    '{title}: un\'escursione imperdibile a {city} il {date}.{time, Ritrovo alle {time}}{location, – {location}}. Scarpe comode e voglia di camminare!',
    'Cammina con noi! {title} a {city} il {date}{time, alle {time}}{location, presso {location}}. Percorsi suggestivi e panorami mozzafiato.',
    'Amanti del trekking, {title} vi aspetta a {city} il {date}.{time, Alle {time}}{location, – {location}}. Un itinerario adatto a tutti i livelli.',
    '{title} – escursione guidata a {city} il {date}.{time, Ore {time}}{location, presso {location}}. Scopri i sentieri più belli del territorio.',
    'Il {date} a {city} si cammina con {title}.{time, Alle {time}}{location, – {location}}. Natura, aria pulita e paesaggi indimenticabili.',
  ],
  montagna: [
    '{title} vi aspetta tra le montagne di {city} il {date}.{time, Alle {time}}{location, – {location}}. Una giornata all\'insegna dell\'aria pura e dei panorami alpini.',
    'La montagna chiama! {title} a {city} il {date}{time, alle {time}}{location, presso {location}}. Un\'esperienza rigenerante tra cime e vallate.',
    'Il {date} a {city} vive la montagna con {title}.{time, Dalle {time}}{location, presso {location}}. Adatto a escursionisti e famiglie.',
    '{title} – montagna e natura a {city}. {date}{time, ore {time}}{location, – {location}}. Vieni a respirare l\'aria fresca delle alture.',
    'A {city} il {date} torna {title}.{time, Alle {time}}{location, presso {location}}. Un\'immersione totale nella bellezza della montagna.',
  ],
  gite: [
    '{title} è la gita perfetta a {city} il {date}.{time, Alle {time}}{location, – {location}}. Porta la famiglia e trascorri una giornata indimenticabile.',
    'In gita a {city} con {title}! {date}{time, alle {time}}{location, presso {location}}. Un\'escursione tra cultura, natura e divertimento.',
    'Il {date} partiamo per {title} da {city}.{time, Alle {time}}{location, – {location}}. Una giornata fuori porta da vivere insieme.',
    '{title}: gita a {city} il {date}.{time, Ore {time}}{location, presso {location}}. Scopri angoli nascosti e luoghi incantevoli.',
    'Pronti per una gita? {title} a {city} il {date}{time, alle {time}}{location, – {location}}. Divertimento assicurato per tutte le età.',
  ],
  spettacolo: [
    '{title} porta lo spettacolo a {city} il {date}.{time, Alle {time}}{location, – {location}}. Una serata di intrattenimento puro da non perdere.',
    'Grande spettacolo a {city}: {title} il {date}.{time, Ore {time}}{location, presso {location}}. Risate, emozioni e divertimento vi aspettano.',
    'Il {date} a {city} va in scena {title}.{time, Alle {time}}{location, presso {location}}. Uno show travolgente per tutte le età.',
    '{title} – l\'evento da non perdere a {city}. {date}{time, alle {time}}{location, – {location}} preparati a stupirti!',
    'A {city} il {date} appuntamento con {title}.{time, Dalle {time}}{location, – {location}}. Intrattenimento di qualità per grandi e piccini.',
  ],
  enogastronomia: [
    '{title} delizia i palati a {city} il {date}.{time, Alle {time}}{location, presso {location}}. Un viaggio tra sapori autentici e tradizione culinaria.',
    'Gusto e tradizione a {city} con {title} il {date}.{time, Ore {time}}{location, – {location}}. Degustazioni, prodotti tipici e specialità locali.',
    'Il {date} a {city} si celebra {title}.{time, Dalle {time}}{location, presso {location}}. Un paradiso per gli amanti del buon cibo e del buon vino.',
    '{title}: enogastronomia a {city} il {date}.{time, Alle {time}}{location, – {location}}. Scopri i sapori autentici del territorio.',
    'Appuntamento con {title} a {city} il {date}.{time, Alle {time}}{location, presso {location}}. Sapori, aromi e tradizioni ti aspettano.',
  ],
  bambini: [
    '{title} è l\'evento perfetto per i bambini a {city} il {date}.{time, Alle {time}}{location, – {location}}. Giochi, laboratori e tanto divertimento per i più piccoli.',
    'Festeggiamo i bambini con {title} a {city} il {date}.{time, Ore {time}}{location, presso {location}}. Un pomeriggio di allegria e attività creative.',
    'Il {date} a {city} c\'è {title}.{time, Dalle {time}}{location, presso {location}}. Porta i tuoi bambini per una giornata indimenticabile.',
    '{title}: un evento per bambini a {city} il {date}.{time, Alle {time}}{location, – {location}}. Divertimento assicurato per i più piccoli.',
    'A {city} il {date} con {title}.{time, Alle {time}}{location, – {location}}. Giochi, animazione e sorprese per tutti i bambini.',
  ],
  borghi: [
    '{title} vi porta alla scoperta di {city} il {date}.{time, Alle {time}}{location, – {location}}. Un itinerario tra storia, tradizioni e bellezze architettoniche.',
    'Esplora i borghi con {title} a {city} il {date}.{time, Ore {time}}{location, presso {location}}. Un viaggio nel cuore dell\'Italia più autentica.',
    'Il {date} a {city} si visita con {title}.{time, Dalle {time}}{location, presso {location}}. Scopri angoli suggestivi e storie affascinanti.',
    '{title}: alla scoperta del borgo di {city}. {date}{time, alle {time}}{location, – {location}}. Un\'esperienza tra cultura e tradizione locale.',
    'Passeggiata tra i vicoli di {city} con {title} il {date}.{time, Alle {time}}{location, – {location}}. Un tuffo nella storia e nell\'atmosfera del borgo.',
  ],
};

const FALLBACK_TEMPLATES = [
  'Non perdere {title} a {city} il {date}.{time, Alle {time}}{location, – {location}}. Un evento da segnare in agenda!',
  '{title} ti aspetta a {city} il {date}.{time, Ore {time}}{location, presso {location}}. Ti aspettiamo numerosi!',
  'Segna la data: {date} a {city} con {title}.{time, Alle {time}}{location, – {location}}. Un appuntamento da non mancare.',
  '{title} arriva a {city} il {date}.{time, Dalle {time}}{location, presso {location}}. Vi aspettiamo!',
];

/* ───── Interpolazione template ───── */

function fillTemplate(tpl: string, e: EnrichEvent): string {
  const dateStr = e.date ? fmtDate(e.date) : 'data da definire';

  let result = tpl
    .replace(/\{title\}/g, e.title)
    .replace(/\{city\}/g, e.city || 'Latina')
    .replace(/\{date\}/g, dateStr)
    .replace(/\{location\}/g, e.location || 'sede da definire');

  // Gestione blocchi condizionali {time, ...}
  result = result.replace(/\{time,([^}]+)\}/g, (_, content: string) => {
    return e.time ? content.trim() : '';
  });

  // Gestione blocchi {location, ...} (fallback se location non presente)
  result = result.replace(/\{location,([^}]+)\}/g, (_, content: string) => {
    return e.location ? content.trim() : '';
  });

  return result;
}

/* ───── Entry point ───── */

export function generateDescription(event: EnrichEvent): string {
  const templates = TEMPLATES[event.categorySlug] || FALLBACK_TEMPLATES;
  const tpl = pick(templates);
  return fillTemplate(tpl, event);
}

/* ───── Batch enrichment ───── */

export function enrichBatch(events: EnrichEvent[]): Map<number, string> {
  const result = new Map<number, string>();
  for (const e of events) {
    result.set(e.id, generateDescription(e));
  }
  return result;
}
