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
    '{title} ti aspetta a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}. Un\'occasione imperdibile per gli amanti del genere.',
    'Preparati a vivere {title} a {city} il {date}. {time?Alle ore }{time}{location?, }{location}. Una serata da non perdere!',
    'Il {date} a {city} va in scena {title}. {time?Alle ore }{time}{location?Presso }{location}. Musica dal vivo, energia e divertimento.',
    '{title} arriva a {city}! {date}. {time?Alle ore }{time}{location?Appuntamento a }{location}.',
    'Musica a tutto volume a {city} con {title} il {date}. {time?Alle ore }{time}{location?– }{location}. Porta gli amici e vieni a ballare!',
  ],
  teatro: [
    '{title} va in scena a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}. Uno spettacolo che emozionerà il pubblico.',
    'Il teatro di {city} ospita {title} il {date}. {time?Alle ore }{time}{location?Presso }{location}. Una pièce da vedere.',
    'Sipario su {title} a {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Un\'esperienza culturale da non perdere.',
    '{title} – teatro a {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Lasciati trasportare dalla magia del palcoscenico.',
    'Grande attesa per {title} a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
  ],
  cultura: [
    '{title}, evento culturale a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Cultura a {city}: {title} il {date}. {time?Alle ore }{time}{location?– }{location}.',
    '{title} ti aspetta a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}. Un viaggio tra arte e storia.',
    'Il {date} a {city} torna {title}. {time?Alle ore }{time}{location?Presso }{location}. Un evento che arricchisce il territorio.',
    'Scopri {title} a {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
  ],
  sport: [
    'Grande sport a {city} con {title} il {date}. {time?Alle ore }{time}{location?– }{location}. Vivi l\'emozione della competizione.',
    '{title} anima {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}. Un evento per atleti e appassionati.',
    'Pronti, partenza, via! {title} a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Sport a {city}: {title} il {date}. {time?Alle ore }{time}{location?– }{location}.',
    '{title} – evento sportivo a {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Vieni a tifare!',
  ],
  natura: [
    '{title} ti porta nella natura a {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Per tutta la famiglia.',
    'Immergiti nella natura con {title} a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Il {date} a {city} si celebra {title}. {time?Alle ore }{time}{location?Presso }{location}. Natura e biodiversità.',
    '{title}: giornata nella natura a {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
    'A {city} il {date}: {title}. {time?Alle ore }{time}{location?Presso }{location}.',
  ],
  trekking: [
    '{title}: escursione a {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Scarpe comode e voglia di camminare!',
    'Cammina con noi! {title} a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Amanti del trekking, {title} vi aspetta a {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
    '{title} – escursione a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Il {date} a {city} si cammina con {title}. {time?Alle ore }{time}{location?– }{location}.',
  ],
  montagna: [
    '{title} tra le montagne di {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Panorami alpini e aria pura.',
    'La montagna chiama! {title} a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Il {date} a {city} vive la montagna con {title}. {time?Alle ore }{time}{location?Presso }{location}.',
    '{title} – montagna a {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
    'A {city} il {date} torna {title}. {time?Alle ore }{time}{location?Presso }{location}.',
  ],
  gite: [
    '{title}: gita a {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Una giornata fuori porta.',
    'In gita a {city} con {title} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Il {date} partiamo per {title} da {city}. {time?Alle ore }{time}{location?– }{location}.',
    '{title} ti aspetta a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Pronti per una gita? {title} a {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
  ],
  spettacolo: [
    '{title} porta lo spettacolo a {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Intrattenimento da non perdere.',
    'Grande spettacolo a {city}: {title} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Il {date} a {city} va in scena {title}. {time?Alle ore }{time}{location?Presso }{location}.',
    '{title} a {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
    'A {city} il {date}: {title}. {time?Alle ore }{time}{location?– }{location}.',
  ],
  enogastronomia: [
    '{title} delizia i palati a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}. Sapori e tradizione.',
    'Gusto e tradizione a {city} con {title} il {date}. {time?Alle ore }{time}{location?– }{location}. Prodotti tipici e degustazioni.',
    'Il {date} a {city} si celebra {title}. {time?Alle ore }{time}{location?Presso }{location}. Un paradiso per buongustai.',
    '{title}: sapori a {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
    'Appuntamento con {title} a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
  ],
  bambini: [
    '{title}, evento per bambini a {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Giochi e laboratori.',
    'Festeggiamo i bambini con {title} a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Il {date} a {city} c\'è {title}. {time?Alle ore }{time}{location?Presso }{location}.',
    '{title}: divertimento per bambini a {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
    'A {city} il {date} con {title}. {time?Alle ore }{time}{location?– }{location}.',
  ],
  borghi: [
    '{title} alla scoperta di {city} il {date}. {time?Alle ore }{time}{location?– }{location}. Storia e bellezze architettoniche.',
    'Esplora i borghi con {title} a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
    'Il {date} a {city} con {title}. {time?Alle ore }{time}{location?Presso }{location}. Angoli suggestivi e storie affascinanti.',
    '{title}: alla scoperta di {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
    'Passeggiata tra i vicoli di {city} con {title} il {date}. {time?Alle ore }{time}{location?– }{location}.',
  ],
};

const FALLBACK_TEMPLATES = [
  'Non perdere {title} a {city} il {date}. {time?Alle ore }{time}{location?– }{location}.',
  '{title} ti aspetta a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
  'Segna la data: {date} a {city} con {title}. {time?Alle ore }{time}{location?– }{location}.',
  '{title} arriva a {city} il {date}. {time?Alle ore }{time}{location?Presso }{location}.',
];

/* ───── Interpolazione template ───── */

function fillTemplate(tpl: string, e: EnrichEvent): string {
  const dateStr = e.date ? fmtDate(e.date) : 'data da definire';
  const timeVal = e.time || '';
  const locVal = e.location || '';

  let result = tpl
    .replace(/\{title\}/g, e.title)
    .replace(/\{city\}/g, e.city || 'Latina')
    .replace(/\{date\}/g, dateStr);

  // Conditional blocks: {time?prefix } — if time exists, keep "prefix"; else remove
  // The actual {time} value is handled by the next step
  result = result.replace(/\{time\?(.+?)\}/g, (_, prefix: string) => {
    return e.time ? prefix : '';
  });
  result = result.replace(/\{location\?(.+?)\}/g, (_, prefix: string) => {
    return e.location ? prefix : '';
  });

  // Replace remaining {time} and {location} with actual values (trailing space for clean concatenation)
  result = result.replace(/\{time\}/g, timeVal ? timeVal + ' ' : '');
  result = result.replace(/\{location\}/g, locVal || '');

  // Clean up: misplaced punctuation, double periods, double spaces
  result = result.replace(/\s+\./g, '.').replace(/\.{2,}/g, '.').replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').trim();

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
