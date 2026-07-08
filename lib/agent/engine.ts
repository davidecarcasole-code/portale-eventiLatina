import { getGenModel, CATEGORY_LIST } from './config';

async function getPrisma() {
  const mod = await import("@/lib/prisma");
  return mod.prisma;
}

export interface AgentResult {
  task: string;
  processed: number;
  details: string;
}

/* ───── Helper Gemini ───── */

async function askGemini(system: string, prompt: string, maxTokens = 200, temp = 0.2): Promise<string> {
  const model = getGenModel();
  const res = await model.generateContent({
    systemInstruction: system,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: temp },
  });
  return res.response.text().trim();
}

/* ───── Classificazione intelligente ───── */

const CLASSIFY_PROMPT = `Assegna una categoria a ogni evento dalla lista: ${CATEGORY_LIST.map(c => c.slug).join(', ')}.
Rispondi SOLO con il nome della categoria in inglese (slug), nient'altro.
Se non sei sicuro, rispondi con "spettacolo".`;

async function classifyEvent(title: string, description: string): Promise<string> {
  const slug = await askGemini(CLASSIFY_PROMPT, `Titolo: ${title}\nDescrizione: ${description || 'nessuna'}`, 20, 0.1);
  const valid = CATEGORY_LIST.find(c => c.slug === slug);
  return valid ? slug : 'spettacolo';
}

export async function classifyAllEvents(): Promise<AgentResult> {
  const prisma = await getPrisma();
  const events = await prisma.event.findMany({
    where: { categoryId: null, isPublished: true },
    take: 50,
    select: { id: true, title: true, description: true, categoryId: true },
  });

  let updated = 0;
  for (const e of events) {
    try {
      const slug = await classifyEvent(e.title, e.description || '');
      const cat = await prisma.category.findUnique({ where: { slug } });
      if (cat) {
        await prisma.event.update({ where: { id: e.id }, data: { categoryId: cat.id } });
        updated++;
      }
    } catch (err: any) {
      console.error(`[Agent] Classify error for #${e.id}: ${err.message?.slice(0, 80)}`);
    }
  }

  return { task: 'classify', processed: updated, details: `Classificati ${updated} eventi su ${events.length} senza categoria` };
}

/* ───── Arricchimento descrizioni ───── */

const ENRICH_SYSTEM = 'Sei un copywriter per eventi culturali. Genera una descrizione breve e accattivante (max 100 parole, in italiano). Se c\'è già una descrizione, migliorala mantenendo i fatti.';

async function enrichDescription(title: string, date: string, city: string, category: string, existingDesc: string): Promise<string> {
  const text = await askGemini(ENRICH_SYSTEM,
    `Titolo: ${title}\nData: ${date}\nCittà: ${city}\nCategoria: ${category}\nDescrizione attuale: ${existingDesc || 'nessuna'}`,
    250, 0.7);
  return text || existingDesc;
}

export async function enrichAllDescriptions(): Promise<AgentResult> {
  const prisma = await getPrisma();
  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      OR: [
        { description: null },
        { description: '' },
      ],
    },
    take: 30,
    select: { id: true, title: true, date: true, city: true, categoryId: true, description: true },
  });

  let updated = 0;
  for (const e of events) {
    try {
      const catSlug = e.categoryId ? (await prisma.category.findUnique({ where: { id: e.categoryId }, select: { slug: true } }))?.slug : 'evento';
      const dateStr = e.date ? e.date.toISOString().split('T')[0] : '';
      const desc = await enrichDescription(e.title, dateStr, e.city || 'Latina', catSlug || 'evento', e.description || '');
      await prisma.event.update({ where: { id: e.id }, data: { description: desc } });
      updated++;
    } catch (err: any) {
      console.error(`[Agent] Enrich error for #${e.id}: ${err.message?.slice(0, 80)}`);
    }
  }

  return { task: 'enrich', processed: updated, details: `Arricchite ${updated} descrizioni su ${events.length} eventi senza descrizione` };
}

/* ───── Dedup avanzato ───── */

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function tokenJaccard(a: string, b: string): number {
  const ta = new Set(normalize(a).split(' ').filter(Boolean));
  const tb = new Set(normalize(b).split(' ').filter(Boolean));
  if (ta.size === 0 && tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export async function dedupEvents(): Promise<AgentResult> {
  const prisma = await getPrisma();
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, date: true, city: true },
    orderBy: { date: 'asc' },
  });

  let removed = 0;
  const groups: number[][] = [];
  const checked = new Set<number>();

  for (let i = 0; i < events.length; i++) {
    if (checked.has(i)) continue;
    const group = [i];
    checked.add(i);
    for (let j = i + 1; j < events.length; j++) {
      if (checked.has(j)) continue;
      const a = events[i];
      const b = events[j];
      const sameDate = a.date && b.date && a.date.toISOString().split('T')[0] === b.date.toISOString().split('T')[0];
      const sameCity = a.city && b.city && normalize(a.city) === normalize(b.city);
      if (!sameDate && !sameCity) continue;
      const score = tokenJaccard(a.title, b.title);
      if (score >= 0.65) {
        group.push(j);
        checked.add(j);
      }
    }
    if (group.length > 1) groups.push(group);
  }

  for (const group of groups) {
    const ids = group.map(i => events[i].id);
    const keep = ids[0];
    const remove = ids.slice(1);
    if (remove.length > 0) {
      await prisma.event.deleteMany({ where: { id: { in: remove } } });
      removed += remove.length;
    }
  }

  return { task: 'dedup', processed: removed, details: `Rimossi ${removed} duplicati su ${events.length} eventi (${groups.length} gruppi di similarità)` };
}

/* ───── Riassunto eventi ───── */

const SUMMARIZE_SYSTEM = 'Sei un organizzatore di eventi. Crea un riassunto accattivante in italiano. Raggruppa per categoria. Scrivi in modo coinvolgente, max 200 parole. Inizia con "🎉 Ecco gli eventi in programma:".';

export async function summarizeEvents(): Promise<AgentResult> {
  const prisma = await getPrisma();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 14);

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      date: { gte: today, lte: weekEnd },
    },
    orderBy: { date: 'asc' },
    take: 30,
    select: { title: true, date: true, city: true, categoryId: true },
  });

  if (events.length === 0) {
    return { task: 'summarize', processed: 0, details: 'Nessun evento nei prossimi 14 giorni' };
  }

  const catNames = await prisma.category.findMany({ select: { id: true, name: true } });
  const catMap = new Map(catNames.map(c => [c.id, c.name]));

  const eventList = events.map(e => {
    const d = e.date ? e.date.toISOString().split('T')[0] : '';
    return `- ${d} | ${e.title} | ${e.city || '?'} | ${catMap.get(e.categoryId || 0) || '?'}`;
  }).join('\n');

  try {
    const text = await askGemini(SUMMARIZE_SYSTEM,
      `Elenco eventi (data | titolo | città | categoria):\n${eventList}`,
      400, 0.7);
    return { task: 'summarize', processed: events.length, details: text || 'Nessun riassunto generato' };
  } catch (err: any) {
    return { task: 'summarize', processed: 0, details: `Errore: ${err.message?.slice(0, 100)}` };
  }
}
