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

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

/* ───── Helper Gemini con retry ───── */

async function askGemini(system: string, prompt: string, maxTokens = 200, temp = 0.2): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY non trovata nelle env');
  const model = getGenModel();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await model.generateContent({
        systemInstruction: system,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: temp },
      });
      const text = res.response.text();
      if (!text) throw new Error('Gemini ha risposto vuoto');
      return text.trim();
    } catch (err: any) {
      if (err.message?.includes('429') && attempt < 4) {
        const wait = 3000 * (attempt + 1);
        await delay(wait);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

/* ───── Classificazione intelligente ───── */

const CLASSIFY_SYSTEM = `Sei un classificatore di eventi. Assegna una categoria a ogni evento dalla lista: ${CATEGORY_LIST.map(c => c.slug).join(', ')}.
Rispondi SOLO con un JSON array di oggetti {"id": numero, "categoria": "slug"}. Se non sei sicuro usa "spettacolo".`;

export async function classifyAllEvents(): Promise<AgentResult> {
  const prisma = await getPrisma();
  const events = await prisma.event.findMany({
    where: { categoryId: null, isPublished: true },
    take: 30,
    select: { id: true, title: true, description: true, categoryId: true },
  });

  if (events.length === 0) return { task: 'classify', processed: 0, details: 'Nessun evento senza categoria' };

  const eventList = events.map(e => `ID:${e.id} | Titolo:${e.title} | Descrizione:${(e.description || 'nessuna').slice(0, 100)}`).join('\n');

  try {
    const text = await askGemini(CLASSIFY_SYSTEM, `Classifica questi eventi:\n${eventList}`, 500, 0.1);
    const json = text.replace(/```json?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(json);
    let updated = 0;
    for (const item of parsed) {
      if (!item.id || !item.categoria) continue;
      const cat = await prisma.category.findUnique({ where: { slug: item.categoria } });
      if (cat) {
        await prisma.event.update({ where: { id: item.id }, data: { categoryId: cat.id } });
        updated++;
      }
    }
    return { task: 'classify', processed: updated, details: `Classificati ${updated}/${events.length} eventi` };
  } catch (err: any) {
    return { task: 'classify', processed: 0, details: `Errore: ${err.message?.slice(0, 200)}` };
  }
}

/* ───── Arricchimento descrizioni (batch) ───── */

const ENRICH_SYSTEM = 'Sei un copywriter per eventi culturali. Genera descrizioni brevi e accattivanti (max 100 parole ciascuna, in italiano). Se c\'è già una descrizione, migliorala mantenendo i fatti.';

export async function enrichAllDescriptions(): Promise<AgentResult> {
  const prisma = await getPrisma();
  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      OR: [{ description: null }, { description: '' }],
    },
    take: 10,
    select: { id: true, title: true, date: true, city: true, categoryId: true, description: true },
  });

  if (events.length === 0) return { task: 'enrich', processed: 0, details: 'Nessun evento senza descrizione' };

  let errors: string[] = [];
  const batchSize = 5;

  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);

    for (const e of batch) {
      if (!e.categoryId) continue;
      const cat = await prisma.category.findUnique({ where: { id: e.categoryId }, select: { slug: true } });
      (e as any)._cat = cat?.slug || 'evento';
    }

    const prompt = batch.map(e =>
      `ID:${e.id} | Titolo:${e.title} | Data:${e.date?.toISOString().split('T')[0] || ''} | Città:${e.city || 'Latina'} | Categoria:${(e as any)._cat || 'evento'} | Descrizione attuale:${e.description || 'nessuna'}`
    ).join('\n');

    try {
      const text = await askGemini(ENRICH_SYSTEM,
        `Per ogni evento, genera una descrizione accattivante (max 100 parole).\nRispondi SOLO con un JSON in questo formato esatto:\n{ "1": "descrizione evento 1", "2": "descrizione evento 2" }\n\nEventi:\n${prompt}`,
        1000, 0.7);

      const braceStart = text.indexOf('{');
      const braceEnd = text.lastIndexOf('}');
      const json = braceStart >= 0 && braceEnd > braceStart
        ? text.slice(braceStart, braceEnd + 1)
        : text.replace(/```json?/g, '').replace(/```/g, '').trim();
      const enriched = JSON.parse(json);

      for (const e of batch) {
        const desc = enriched[String(e.id)];
        if (desc && typeof desc === 'string' && desc.length > 10) {
          await prisma.event.update({ where: { id: e.id }, data: { description: desc } });
        }
      }
    } catch (err: any) {
      errors.push(`batch ${i + 1}-${i + batch.length}: ${err.message?.slice(0, 200)}`);
    }
  }

  const updated = events.length - errors.length * batchSize;
  return { task: 'enrich', processed: Math.max(0, updated), details: `Arricchite ${Math.max(0, updated)}/${events.length}${errors.length ? `\nErrori: ${errors.join('; ')}` : ''}` };
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
